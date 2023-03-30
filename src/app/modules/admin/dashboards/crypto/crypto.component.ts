import { CompanyModel } from 'app/models/company.model';
import { HttpErrorResponse } from '@angular/common/http';
import { AlertService } from 'app/shared/alert.service';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { debounceTime, Subject, throwError } from 'rxjs';
import { ApexOptions } from 'ng-apexcharts';
import { CryptoService } from 'app/modules/admin/dashboards/crypto/crypto.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { NgForm, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Person } from 'app/models/legal.person.model';
import { fuseAnimations } from '@fuse/animations';
import { SearchService } from 'app/shared/search.service';
import { MessagesEnum } from 'app/enums/messages.enum';
import { ConfirmationDialogComponent } from '../../ui/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ALERT_REASONS } from 'app/enums/alerts.messages.enum';


@Component({
    selector: 'crypto',
    templateUrl: './crypto.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations
})
export class CryptoComponent implements OnInit, OnDestroy {

    @ViewChild('registerCompanyNgForm') registerCompanyNgForm: NgForm;
    @ViewChild('recentTransactionsTable', { read: MatSort }) recentTransactionsTableMatSort: MatSort;

    data: any;
    accountBalanceOptions: ApexOptions;
    recentTransactionsDataSource: MatTableDataSource<any> = new MatTableDataSource();
    recentTransactionsTableColumns: string[] = ['name', 'document', 'address', 'phone', 'typeCenter', 'description','state', 'actions'];
    _unsubscribeAll: Subject<any> = new Subject<any>();
    registerCompanyForm: UntypedFormGroup;
    updateCompanyBtn: boolean = false
    idCompany: number = 0
    configForm: UntypedFormGroup;
    subjectKeyUp = new Subject<any>()

    constructor(
        private _cryptoService: CryptoService,
        private _formBuilder: UntypedFormBuilder,
        public alertService: AlertService,
        private searchService: SearchService,
        public dialog: MatDialog
    ) {
    }

    ngOnInit(): void {
        this.registerCompanyForm = this._formBuilder.group({
            name: ['', Validators.required],
            document: ['', Validators.required],
            address: ['', Validators.required],
            phone: ['', Validators.required],
            typeCenter: ['', Validators.required],
            description: ['', Validators.required]
        });
        this.getAllCompanies()
    }

    getAllCompanies() {
        this.data = []
        this.recentTransactionsDataSource.data = []
        this._cryptoService.getData().subscribe(data => {
            this.data = data;
            this.recentTransactionsDataSource.data = data.reverse();
        }, (response => {
            this.alertService.showAlertMessage('error', response.error.message)
        }))
    }

    createCompany() {
        if (this.registerCompanyForm.invalid) {
            this.alertService.showAlertMessage('error', 'Debe de completar todos los campos')
            return
        }

        this.registerCompanyForm.disable();

        this._cryptoService.createCompany(this.buildCompanyModel()).subscribe(data => {
            this.registerCompanyForm.enable();
            this.registerCompanyForm.reset()
            this.registerCompanyNgForm.resetForm();
            this.getAllCompanies()
            this.alertService.showAlertMessage('info', 'Registro creado !')
        }, (response: HttpErrorResponse) => {
            this.alertService.showAlertMessage('error', response.error.message)
            this.registerCompanyForm.enable()
        })
    }

    editCompany(company: CompanyModel) {
        this.updateCompanyBtn = true
        this.registerCompanyForm.get('name').setValue(company.name);
        this.registerCompanyForm.get('document').setValue(company.ruc);
        this.registerCompanyForm.get('address').setValue(company.address);
        this.registerCompanyForm.get('phone').setValue(company.phone);
        this.registerCompanyForm.get('typeCenter').setValue(company.typeCenter);
        this.registerCompanyForm.get('description').setValue(company.description);
        this.idCompany = company.id
    }

    updateCompany() {
        if (this.registerCompanyForm.invalid) {
            this.alertService.showAlertMessage('error', 'Debe de completar todos los campos')
            return
        }
        this.registerCompanyForm.disable();

        this._cryptoService.updateCompany(this.buildCompanyModel(), this.idCompany).subscribe(data => {
            this.alertService.showAlertMessage('success', 'Registro actualizado exitosamente')
            this.registerCompanyForm.enable();
            this.registerCompanyForm.reset()
            this.registerCompanyNgForm.resetForm();
            this.clearFilters()
            this.getAllCompanies()
            this.alertService.showAlertMessage('info', 'Registro actualizado !')
        }, (response: HttpErrorResponse) => {
            this.alertService.showAlertMessage('error', response.error.mensaje)
            this.registerCompanyForm.enable()
        })
    }

    buildCompanyModel(): CompanyModel {
        const companyModel: CompanyModel = {
            name: this.registerCompanyForm.value.name,
            ruc: this.registerCompanyForm.value.document,
            address: this.registerCompanyForm.value.address,
            phone: this.registerCompanyForm.value.phone,
            typeCenter: this.registerCompanyForm.value.typeCenter,
            description: this.registerCompanyForm.value.description
        }

        return companyModel
    }

    deleteCompany(company: CompanyModel) {
        this._cryptoService.deleteCompany(company.id).subscribe(data => {
            this.alertService.showAlertMessage('success', 'Registro eliminado !')
            this.getAllCompanies()
        }, (response: HttpErrorResponse) => {
            this.alertService.showAlertMessage('error', response.error.message)
        })
    }

    dismiss(name: string) {
        this.clearFilters()
    }

    clearFilters() {
        this.updateCompanyBtn = false
        this.registerCompanyForm.enable();
        this.registerCompanyForm.reset()
        this.registerCompanyNgForm.resetForm();
        this.alertService.hideAlertMessage()
    }

    ngAfterViewInit(): void {
        this.recentTransactionsDataSource.sort = this.recentTransactionsTableMatSort;
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

}
