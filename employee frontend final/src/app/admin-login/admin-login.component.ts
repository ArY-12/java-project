import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.css']
})
export class AdminLoginComponent {
  adminName: string = '';
  adminPassword: string = '';
  isLogin: boolean = true;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  login() {
    if (!this.adminName || !this.adminPassword) {
      this.errorMessage = 'Please enter username and password';
      return;
    }

    const loginData = {
      adminName: this.adminName,
      adminPassword: this.adminPassword
    };

    this.http.post(`${environment.apiUrl}/admin/login`, loginData).subscribe(
      (response: any) => {
        this.successMessage = 'Login successful!';
        this.errorMessage = '';
        localStorage.setItem('admin', JSON.stringify(response.admin));
        setTimeout(() => {
          this.router.navigate(['/show-all-employees']);
        }, 1000);
      },
      (error) => {
        this.errorMessage = 'Invalid username or password';
        this.successMessage = '';
        console.error('Login error:', error);
      }
    );
  }

  register() {
    if (!this.adminName || !this.adminPassword) {
      this.errorMessage = 'Please enter username and password';
      return;
    }

    const registerData = {
      adminName: this.adminName,
      adminPassword: this.adminPassword
    };

    this.http.post(`${environment.apiUrl}/admin/register`, registerData).subscribe(
      (response: any) => {
        this.successMessage = 'Registration successful! Please login.';
        this.errorMessage = '';
        this.adminName = '';
        this.adminPassword = '';
        this.isLogin = true;
      },
      (error) => {
        this.errorMessage = 'Registration failed. Please try again.';
        this.successMessage = '';
        console.error('Register error:', error);
      }
    );
  }

  toggleForm() {
    this.isLogin = !this.isLogin;
    this.errorMessage = '';
    this.successMessage = '';
    this.adminName = '';
    this.adminPassword = '';
  }
}
