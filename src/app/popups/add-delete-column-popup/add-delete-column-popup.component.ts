import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';


@Component({
  selector: 'app-add-delete-column-popup',
  standalone: true,
  imports: [MatInputModule,MatFormFieldModule, CommonModule,FormsModule,MatIconModule,ReactiveFormsModule,MatButtonModule],
  
  templateUrl: './add-delete-column-popup.component.html',
  styleUrl: './add-delete-column-popup.component.scss'
})
export class AddDeleteColumnPopupComponent {
  columnsForm: FormGroup;
  columnKeys: string[] = [];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddDeleteColumnPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: string[]
  ) {
    // Initialize the form with existing columns
    this.columnsForm = this.fb.group({});
    this.data.forEach((column, index) => {
      if(column !== 'day' && column !== 'completed'   ){
        const key = `column${index}`;
        this.columnKeys.push(key);
        this.columnsForm.addControl(key, this.fb.control(column, Validators.required));
      }
    
    });
  }

  addColumn(): void {
    const key = `column${this.columnKeys.length}`;
    this.columnKeys.push(key);
    this.columnsForm.addControl(key, this.fb.control('', Validators.required));
  }

  deleteColumn(key: string): void {
    this.columnKeys = this.columnKeys.filter((k) => k !== key);
    this.columnsForm.removeControl(key);
  }

  saveColumns(): void {
    if (this.columnsForm.valid) {
      const updatedColumns = this.columnKeys.map((key) => this.columnsForm.get(key)?.value);
      this.dialogRef.close(updatedColumns);
    }
  }
}
