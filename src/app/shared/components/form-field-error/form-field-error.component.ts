import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-form-field-error',
  template: `
    <p class="text-danger">
      {{errorMessage}}
    </p>
  `,
  styleUrls: ['./form-field-error.component.css']
})
export class FormFieldErrorComponent implements OnInit {

  @Input('form-control') formControl: FormControl;

  constructor() { }

  ngOnInit() {
  }

  public get errorMessage(): string | null {
    if (this.mustShowErrorMessage()) {
      return this.getErrorMessage();
    } else {
      return null;
    }
  }

  private mustShowErrorMessage(): boolean {
    return this.formControl.invalid && this.formControl.touched;
  }

  private getErrorMessage(): string | null {

    if (this.formControl.errors.required) {
      return 'Campo obrigatório';
    } else if (this.formControl.errors.minlength) {
      const min = this.formControl.errors.minlength.requiredLength;
      return `Deve ter no mínimo ${min} caracteres`;
    } else if (this.formControl.errors.maxlength) {
      const max = this.formControl.errors.maxlength.requiredLength;
      return `Deve ter no máximo ${max} caracteres`;
    }
  }


}
