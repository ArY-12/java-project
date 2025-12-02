import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ShowDetailsComponent } from './show-details.component';
import { EmployeeService } from '../employee.service';
import { of } from 'rxjs';

describe('ShowDetailsComponent', () => {
  let component: ShowDetailsComponent;
  let fixture: ComponentFixture<ShowDetailsComponent>;

  beforeEach(async () => {
    const mockActivatedRoute = {
      snapshot: {
        params: { id: 1 }
      },
      params: of({ id: 1 })
    };

    await TestBed.configureTestingModule({
      declarations: [ ShowDetailsComponent ],
      imports: [ HttpClientTestingModule, RouterModule ],
      providers: [
        EmployeeService,
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShowDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
