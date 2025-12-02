import { TestBed } from '@angular/core/testing';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { AppComponent } from './app.component';
import { of } from 'rxjs';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppComponent ],
      imports: [ RouterModule ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({}),
            paramMap: of(new Map())
          }
        }
      ]
    })
    .compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
