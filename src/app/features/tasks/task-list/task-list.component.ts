import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TasksService } from '../../../core/services/tasks.service';
import { ContactsService } from '../../../core/services/contacts.service';
import { ToastService } from '../../../core/services/toast.service';
import { Task, TaskPriority, TaskStatus } from '../../../core/models/task.model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-task-list',
  imports: [RouterLink, FormsModule, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-5">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Tasks</h1>
          <p class="text-gray-500 text-sm mt-0.5">{{ tasksService.pendingTasks() }} pending</p>
        </div>
        <a
          routerLink="/tasks/new"
          class="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          New Task
        </a>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap gap-3">
        <select
          [ngModel]="statusFilter()"
          (ngModelChange)="statusFilter.set($event)"
          class="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <select
          [ngModel]="priorityFilter()"
          (ngModelChange)="priorityFilter.set($event)"
          class="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
        >
          <option value="">All priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      <!-- Task list -->
      <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
        @if (tasksService.loading()) {
          <div class="flex items-center justify-center py-16">
            <svg class="animate-spin h-8 w-8 text-primary-500" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
          </div>
        } @else if (filteredTasks().length === 0) {
          <p class="text-center text-sm text-gray-500 py-12">No tasks found.</p>
        } @else {
          <div class="divide-y divide-gray-100">
            @for (task of filteredTasks(); track task.id) {
              <div class="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                <!-- Priority dot -->
                <span class="w-2 h-2 rounded-full shrink-0" [class]="getPriorityDot(task.priority)"></span>

                <!-- Content -->
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-sm text-gray-900" [class.line-through]="task.status === 'completed'">
                    {{ task.title }}
                  </p>
                  <div class="flex items-center gap-3 mt-0.5">
                    @if (getContactName(task.contactId); as name) {
                      <span class="text-xs text-gray-500">{{ name }}</span>
                    }
                    <span class="text-xs text-gray-400">Due: {{ task.dueDate | date: 'mediumDate' }}</span>
                  </div>
                </div>

                <!-- Status badge -->
                <span class="text-xs px-2 py-0.5 rounded-full font-medium hidden sm:inline-flex" [class]="getStatusClass(task.status)">
                  {{ task.status }}
                </span>

                <!-- Priority badge -->
                <span class="text-xs px-2 py-0.5 rounded-full font-medium hidden md:inline-flex" [class]="getPriorityClass(task.priority)">
                  {{ task.priority }}
                </span>

                <!-- Actions -->
                <div class="flex items-center gap-1 shrink-0">
                  <a
                    [routerLink]="['/tasks', task.id, 'edit']"
                    class="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                  </a>
                  <button
                    (click)="confirmDelete(task)"
                    class="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              </div>
            }
          </div>
        }
      </div>

      <!-- Delete dialog -->
      @if (deleteTarget()) {
        <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full">
            <h3 class="font-bold text-gray-900 text-lg">Delete Task</h3>
            <p class="text-gray-600 text-sm mt-2">Delete <strong>{{ deleteTarget()!.title }}</strong>?</p>
            <div class="flex justify-end gap-3 mt-5">
              <button (click)="deleteTarget.set(null)" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">Cancel</button>
              <button (click)="deleteTask()" class="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg">Delete</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class TaskListComponent implements OnInit {
  readonly tasksService = inject(TasksService);
  private readonly contactsService = inject(ContactsService);
  private readonly toast = inject(ToastService);

  readonly statusFilter = signal<TaskStatus | ''>('');
  readonly priorityFilter = signal<TaskPriority | ''>('');
  readonly deleteTarget = signal<Task | null>(null);

  readonly filteredTasks = computed(() => {
    const s = this.statusFilter().toLowerCase();
    const p = this.priorityFilter().toLowerCase();
    return this.tasksService.tasks().filter((t) => {
      const matchStatus = !s || t.status === s;
      const matchPriority = !p || t.priority === p;
      return matchStatus && matchPriority;
    });
  });

  ngOnInit(): void {
    this.tasksService.loadTasks();
    this.contactsService.loadContacts();
  }

  getContactName(id: string): string {
    return this.contactsService.contacts().find((c) => c.id === id)?.name ?? '';
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-700',
      'in-progress': 'bg-blue-100 text-blue-700',
      completed: 'bg-emerald-100 text-emerald-700',
    };
    return map[status] ?? 'bg-gray-100 text-gray-600';
  }

  getPriorityClass(priority: string): string {
    const map: Record<string, string> = {
      high: 'bg-red-100 text-red-700',
      medium: 'bg-amber-100 text-amber-700',
      low: 'bg-gray-100 text-gray-600',
    };
    return map[priority] ?? 'bg-gray-100 text-gray-600';
  }

  getPriorityDot(priority: string): string {
    const map: Record<string, string> = {
      high: 'bg-red-500',
      medium: 'bg-amber-400',
      low: 'bg-gray-300',
    };
    return map[priority] ?? 'bg-gray-300';
  }

  confirmDelete(task: Task): void {
    this.deleteTarget.set(task);
  }

  deleteTask(): void {
    const task = this.deleteTarget();
    if (!task) return;
    this.tasksService.delete(task.id).subscribe({
      next: () => {
        this.toast.success('Task deleted.');
        this.deleteTarget.set(null);
      },
      error: () => this.toast.error('Failed to delete task.'),
    });
  }
}
