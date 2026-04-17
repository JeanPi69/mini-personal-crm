import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    loadComponent: () =>
      import('./layout/main-layout/main-layout.component').then((m) => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'contacts',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/contacts/contact-list/contact-list.component').then(
                (m) => m.ContactListComponent
              ),
          },
          {
            path: 'new',
            loadComponent: () =>
              import('./features/contacts/contact-form/contact-form.component').then(
                (m) => m.ContactFormComponent
              ),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./features/contacts/contact-detail/contact-detail.component').then(
                (m) => m.ContactDetailComponent
              ),
          },
          {
            path: ':id/edit',
            loadComponent: () =>
              import('./features/contacts/contact-form/contact-form.component').then(
                (m) => m.ContactFormComponent
              ),
          },
        ],
      },
      {
        path: 'deals',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/deals/deal-board/deal-board.component').then(
                (m) => m.DealBoardComponent
              ),
          },
          {
            path: 'new',
            loadComponent: () =>
              import('./features/deals/deal-form/deal-form.component').then(
                (m) => m.DealFormComponent
              ),
          },
          {
            path: ':id/edit',
            loadComponent: () =>
              import('./features/deals/deal-form/deal-form.component').then(
                (m) => m.DealFormComponent
              ),
          },
        ],
      },
      {
        path: 'tasks',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/tasks/task-list/task-list.component').then(
                (m) => m.TaskListComponent
              ),
          },
          {
            path: 'new',
            loadComponent: () =>
              import('./features/tasks/task-form/task-form.component').then(
                (m) => m.TaskFormComponent
              ),
          },
          {
            path: ':id/edit',
            loadComponent: () =>
              import('./features/tasks/task-form/task-form.component').then(
                (m) => m.TaskFormComponent
              ),
          },
        ],
      },
      {
        path: 'admin',
        canActivate: [roleGuard('admin')],
        children: [
          {
            path: 'users',
            loadComponent: () =>
              import('./features/admin/user-list/user-list.component').then(
                (m) => m.UserListComponent
              ),
          },
          {
            path: 'users/new',
            loadComponent: () =>
              import('./features/admin/user-form/user-form.component').then(
                (m) => m.UserFormComponent
              ),
          },
          {
            path: 'users/:id/edit',
            loadComponent: () =>
              import('./features/admin/user-form/user-form.component').then(
                (m) => m.UserFormComponent
              ),
          },
        ],
      },
    ],
  },
  {
    path: '404',
    loadComponent: () =>
      import('./shared/components/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
  { path: '**', redirectTo: '404' },
];
