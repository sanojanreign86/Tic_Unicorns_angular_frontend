import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, HostListener, inject, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { ThemeService } from '../../core/services/theme.service';
import { PORTAL_MODULES, roleCanAccess } from '../../core/config/portal-modules';
import { AppIconComponent } from '../../shared/components/app-icon/app-icon';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, AppIconComponent],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css'
})
export class MainLayoutComponent implements OnInit {
  readonly auth = inject(AuthService);
  readonly theme = inject(ThemeService);
  private readonly api = inject(ApiService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly router = inject(Router);
  sidebarOpen = false;
  profileOpen = false;
  unreadCount = 0;
  get user() { return this.auth.getCurrentUser(); }
  readonly modules = PORTAL_MODULES.filter((module) => roleCanAccess(module.roles, this.auth.getRole()));

  ngOnInit(): void { this.loadUnreadCount(); }

  @HostListener('window:campus-notifications-changed')
  onNotificationsChanged(): void {
    this.loadUnreadCount();
  }
  toggleSidebar(): void { this.sidebarOpen = !this.sidebarOpen; }
  closeSidebar(): void { this.sidebarOpen = false; }
  toggleProfile(): void { this.profileOpen = !this.profileOpen; }
  toggleTheme(): void { this.theme.toggle(); }
  loadUnreadCount(): void {
    this.api.get<{ unreadCount:number }>('Notification/my/unread-count').subscribe({next:r=>{this.unreadCount=r.unreadCount||0;this.cdr.markForCheck();},error:()=>{}});
  }
  logout(): void {
    this.auth.logoutLocal();
    void this.router.navigate(['/login']);
  }
}
