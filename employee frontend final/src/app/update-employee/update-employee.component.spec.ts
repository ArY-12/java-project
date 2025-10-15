import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UpdateEmployeeComponent } from './update-employee.component';
import { EmployeeService } from '../employee.service';
import { of } from 'rxjs';

describe('UpdateEmployeeComponent', () => {
  let component: UpdateEmployeeComponent;
  let fixture: ComponentFixture<UpdateEmployeeComponent>;

  beforeEach(async () => {
    const mockActivatedRoute = {
      snapshot: {
        params: { id: 1 }
      },
      params: of({ id: 1 })
    };

    await TestBed.configureTestingModule({
      declarations: [ UpdateEmployeeComponent ],
      imports: [ HttpClientTestingModule, ReactiveFormsModule, FormsModule ],
      providers: [
        EmployeeService,
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateEmployeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
