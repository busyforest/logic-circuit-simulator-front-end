import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CircuitEditorComponent } from './circuit-editor.component';

describe('CircuitEditorComponent', () => {
  let component: CircuitEditorComponent;
  let fixture: ComponentFixture<CircuitEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CircuitEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CircuitEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
