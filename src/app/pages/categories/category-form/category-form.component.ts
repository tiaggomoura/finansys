import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'

import { Category } from '../shared/category.model'
import { CategoryService } from '../shared/category.service'

import { switchMap } from 'rxjs/operators'

import toastr from 'toastr'


@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.css']
})
export class CategoryFormComponent implements OnInit {

  currentAction: string;
  categoryForm: FormGroup;
  pageTile: string;
  serverErrorMessasges: string[] = null;
  submittingForm: boolean = false;
  category: Category = new Category();

  constructor(
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.setCurrentAction();
    this.buildCategoryForm();
    this.loadCategory();
  }

  ngAfterContentChecked() {
    this.setPageTitle();
  }

  submitForm() {
    this.submittingForm = true;
    if (this.currentAction == 'new') {
      this.createCategory();
    } else {
      this.updateCategory();
    }

  }

  private actionsForSuccess(category: Category): void {
    toastr.success("Operação realizada com sucesso.");
    //redirect and reload component page
    this.router.navigateByUrl('categories', { skipLocationChange: true }).then(
      () => this.router.navigate(['categories', category.id, 'edit'])
    )
  }

  private actionsForError(error): void {
    toastr.error("Ocorreu um erro em sua solicitação.");
    this.submittingForm = false;
    if (error.status == 422) {
      this.serverErrorMessasges = ["Falha na comunicação com o servidor. Por favor, tente novamente."]
    }
  }

  private createCategory() {
    const category: Category = Object.assign(new Category(), this.categoryForm.value);
    this.categoryService.create(category)
      .subscribe(
        category => this.actionsForSuccess(category),
        error => this.actionsForError(error)
      )
  }

  private updateCategory() {
    const category: Category = Object.assign(new Category(), this.categoryForm.value);
    this.categoryService.update(category)
      .subscribe(
        category => this.actionsForSuccess(category),
        error => this.actionsForError(error)
      )
  }

  private setPageTitle() {
    if (this.currentAction == 'new') {
      this.pageTile = 'Nova Categoria';
    } else {
      const categoryName = this.category.name || "";
      this.pageTile = 'Editando Categoria: ' + categoryName;
    }
  }

  private setCurrentAction() {
    if (this.route.snapshot.url[0].path == "new") {
      this.currentAction = 'new';
    } else {
      this.currentAction = 'edit';
    }
  }

  private buildCategoryForm() {
    this.categoryForm = this.formBuilder.group({
      id: [null],
      name: [null, [Validators.required, Validators.minLength(2)]],
      description: [null]
    });
  }

  private loadCategory() {
    if (this.currentAction == "edit") {
      this.route.paramMap.pipe(
        switchMap(params => this.categoryService.getById(+params.get("id")))
      ).subscribe(
        (category) => {
          this.category = category;
          this.categoryForm.patchValue(category); // bind loaded category data to categoryForm
        },
        (error) => alert('ocorreum erro no servidor, tente novamente.')
      )
    }
  }

}
