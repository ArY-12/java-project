import { Component } from '@angular/core';
import { Employee } from '../employee';
import { EmployeeService } from '../employee.service';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-add-employee',
  templateUrl: './add-employee.component.html',
  styleUrls: ['./add-employee.component.css']
})
export class AddEmployeeComponent {
  employee: Employee = new Employee();
  successMessage: string = '';
  errorMessage: string = '';

  constructor(
    private employeeService: EmployeeService,
    private router: Router
  ) {}

  saveEmployee() {
    if (!this.employee.fname || !this.employee.lname || !this.employee.email) {
      this.errorMessage = 'Please fill all required fields';
      return;
    }

    this.employeeService.addEmployee(this.employee).subscribe(
      (data) => {
        this.successMessage = 'Employee added successfully!';
        this.errorMessage = '';
        console.log('Employee saved:', data);
        setTimeout(() => {
          this.goToEmployeeList();
        }, 1500);
      },
      (error) => {
        this.errorMessage = 'Error adding employee. Please try again.';
        this.successMessage = '';
        console.error('Error:', error);
      }
    );
  }

  goToEmployeeList() {
    this.router.navigate(['/show-all-employees']);
  }

  onSubmit() {
    console.log('Submitting employee:', this.employee);
    this.saveEmployee();
  }
}
