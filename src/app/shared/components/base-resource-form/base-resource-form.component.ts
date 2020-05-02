import { AfterContentChecked, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { BaseResourceService } from 'src/app/shared/services/base-resource.service';
import toastr from 'toastr';
import { BaseResourceModel } from '../../models/base-resource.model';


export abstract class BaseResourceFormComponent<T extends BaseResourceModel> implements OnInit, AfterContentChecked {

  currentAction: string;
  resourceForm: FormGroup;
  pageTile: string;
  serverErrorMessasges: string[] = null;
  submittingForm: boolean = false;

  protected route: ActivatedRoute;
  protected router: Router;
  protected formBuilder: FormBuilder;

  constructor(
    protected injector: Injector,
    public resource: T,
    protected resourceService: BaseResourceService<T>,
    protected jsonDataToResourceFn: (jsonData) => T
  ) {
    this.route = this.injector.get(ActivatedRoute);
    this.router = this.injector.get(Router);
    this.formBuilder = this.injector.get(FormBuilder);
  }

  ngOnInit() {
    this.setCurrentAction();
    this.buildResourceForm();
    this.loadResource();
  }

  ngAfterContentChecked() {
    this.setPageTitle();
  }

  submitForm() {
    this.submittingForm = true;
    if (this.currentAction == 'new') {
      this.createResource();
    } else {
      this.updateResource();
    }

  }

  protected actionsForSuccess(resource: T): void {
    toastr.success("Operação realizada com sucesso.");

    const baseCompontenPath: string = this.route.snapshot.parent.url[0].path;

    //redirect and reload component page
    this.router.navigateByUrl(baseCompontenPath, { skipLocationChange: true }).then(
      () => this.router.navigate([baseCompontenPath, resource.id, 'edit'])
    );
  }

  protected actionsForError(error): void {
    toastr.error("Ocorreu um erro em sua solicitação.");
    this.submittingForm = false;
    if (error.status == 422) {
      this.serverErrorMessasges = ["Falha na comunicação com o servidor. Por favor, tente novamente."]
    }
  }

  protected createResource() {
    const resource: T = this.jsonDataToResourceFn(this.resourceForm.value);
    this.resourceService.create(resource)
      .subscribe(
        category => this.actionsForSuccess(category),
        error => this.actionsForError(error)
      );
  }

  protected updateResource() {
    const resource: T = this.jsonDataToResourceFn(this.resourceForm.value)
    this.resourceService.update(resource)
      .subscribe(
        resource => this.actionsForSuccess(resource),
        error => this.actionsForError(error)
      );
  }

  protected setPageTitle() {
    if (this.currentAction == 'new') {
      this.pageTile = this.creationPageTitle();
    } else {
      this.pageTile = this.edtionPageTitle();
    }
  }

  protected edtionPageTitle(): string {
    return 'Edição';
  }

  protected creationPageTitle(): string {
    return 'Novo';
  }

  protected setCurrentAction() {
    if (this.route.snapshot.url[0].path == 'new') {
      this.currentAction = 'new';
    } else {
      this.currentAction = 'edit';
    }
  }

  protected loadResource() {
    if (this.currentAction == 'edit') {
      this.route.paramMap.pipe(
        switchMap(params => this.resourceService.getById(+params.get('id')))
      ).subscribe(
        (resource) => {
          this.resource = resource;
          this.resourceForm.patchValue(resource); // bind loaded category data to categoryForm
        },
        (error) => alert('ocorreum erro no servidor, tente novamente.')
      );
    }
  }

  protected abstract buildResourceForm(): void;
}
