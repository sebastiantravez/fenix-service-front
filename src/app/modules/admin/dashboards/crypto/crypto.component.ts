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
import { LegalRepresentativeModel, Person } from 'app/models/legal.representative.model';
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
    recentTransactionsTableColumns: string[] = ['name', 'commercialName', 'document', 'mobile', 'status', 'actions'];
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
        this.subjectKeyUp.pipe(debounceTime(1000)).subscribe((value) => {
            this.getCompaniesSearch(value)
        })
        this.registerCompanyForm = this._formBuilder.group({
            name: ['', Validators.required],
            commercialName: ['', [Validators.required]],
            document: ['', Validators.required],
            phone: ['', Validators.required],
            mobile: ['', Validators.required],
            representativeName: ['', Validators.required],
            representativeLastname: ['', Validators.required],
            representativeDocument: ['', Validators.required],
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
        this.registerCompanyForm.get('commercialName').setValue(company.commercialName);
        this.registerCompanyForm.get('document').setValue(company.document);
        this.registerCompanyForm.get('phone').setValue(company.phone);
        this.registerCompanyForm.get('mobile').setValue(company.mobile);
        this.registerCompanyForm.get('representativeName').setValue(company.legalRepresentative.person.name);
        this.registerCompanyForm.get('representativeLastname').setValue(company.legalRepresentative.person.lastName);
        this.registerCompanyForm.get('representativeDocument').setValue(company.legalRepresentative.person.document);
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
            this.alertService.showAlertMessage('error', response.error.message)
            this.registerCompanyForm.enable()
        })
    }

    buildCompanyModel(): CompanyModel {
        const person: Person = {
            name: this.registerCompanyForm.value.representativeName,
            lastName: this.registerCompanyForm.value.representativeLastname,
            document: this.registerCompanyForm.value.representativeDocument
        }

        const legal: LegalRepresentativeModel = {
            person: person
        }

        const companyModel: CompanyModel = {
            name: this.registerCompanyForm.value.name,
            commercialName: this.registerCompanyForm.value.commercialName,
            document: this.registerCompanyForm.value.document,
            mobile: this.registerCompanyForm.value.mobile,
            phone: this.registerCompanyForm.value.mobile,
            legalRepresentative: legal,
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

    searchCompany(event: any) {
        if (event.code == 'Enter') {
            this.getCompaniesSearch(event.target.value)
        } else {
            this.subjectKeyUp.next(event.target.value)
        }
    }

    getCompaniesSearch(value: string) {
        this.searchService.genericSearch(value, 'company').subscribe(data => {
            this.data = data;
            this.recentTransactionsDataSource.data = data.reverse();
            this.alertService.hideAlertMessage()
        }, (response: any) => {
            this.alertService.showAlertMessage('warning', MessagesEnum.DEFAULT_MESSAGE_ERROR)
        });
    }

    activateCompany(company: CompanyModel) {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '500px',
            data: { data: company, typeAlert: ALERT_REASONS.COMPANY_MANAGER },
        });
        dialogRef.afterClosed().subscribe(result => {

        });
    }

    quote(company: CompanyModel) {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            data: { data: company, typeAlert: ALERT_REASONS.COMPANY_QUOTE },
        });
        dialogRef.afterClosed().subscribe(result => {

        });
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
