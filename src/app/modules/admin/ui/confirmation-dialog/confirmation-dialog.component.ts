import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, Inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { NgForm, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Roles } from 'app/enums/roles.enum';
import { BusinessManagerModel } from 'app/models/business.manager';
import { CompanyModel } from 'app/models/company.model';
import { PersonModel } from 'app/models/person.model';
import { Quotes, QuotesManagerModel } from 'app/models/quotes.manager';
import { AlertService } from 'app/shared/alert.service';
import { CryptoService } from '../../dashboards/crypto/crypto.service';

@Component({
    selector: 'confirmation',
    templateUrl: './confirmation-dialog.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmationDialogComponent implements OnInit {
    configForm: UntypedFormGroup;
    formFieldHelpers: string[] = [''];
    businessManagerForm: UntypedFormGroup;
    quotesManagerForm: UntypedFormGroup;
    recentTransactionsDataSource: MatTableDataSource<any> = new MatTableDataSource();
    recentTransactionsTableColumns: string[] = ['id', 'rol', 'quote', 'actions'];
    dataTable: any;

    constructor(
        public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private _formBuilder: UntypedFormBuilder,
        private _cryptoService: CryptoService,
        public alertService: AlertService
    ) {
        this.alertService.alert.message = ''
        this.alertService.hideMessageConfigAlert()
    }

    ngOnInit(): void {
        this.businessManagerForm = this._formBuilder.group({
            name: ['', [Validators.required]],
            lastName: ['', Validators.required],
            document: ['', Validators.required],
            email: ['', Validators.email],
        });

        this.quotesManagerForm = this._formBuilder.group({
            quoteone: ['', [Validators.required]],
            quotetwo: ['', Validators.required],
            quotethree: ['', Validators.required]
        });
        this.getQuotes()
    }

    getQuotes() {
        this.dataTable = []
        this.recentTransactionsDataSource.data = []
        this._cryptoService.getAllQuotesManager(this.data.data.id).subscribe(data => {
            this.dataTable = data;
            this.recentTransactionsDataSource.data = data;
        }, (response => {
            this.alertService.showAlertMessage('error', response.error.message)
        }))
    }

    closeDialog(): void {
        this.dialogRef.close();
    }

    saveCompanyManager(company: any) {
        if (this.businessManagerForm.invalid) {
            return
        }

        let person: PersonModel = {
            name: this.businessManagerForm.value.name,
            lastName: this.businessManagerForm.value.lastName,
            document: this.businessManagerForm.value.document
        }

        let businessManagerModel: BusinessManagerModel = { email: this.businessManagerForm.value.email, person: person, companyId: company.data.id }

        this._cryptoService.saveBusinessManager(businessManagerModel).subscribe(data => {
            this.businessManagerForm.enable();
            this.businessManagerForm.reset()
            this.dialogRef.close(true)
            this.alertService.showMessageConfigAlert('success', 'Registro creado')
        }, (response: HttpErrorResponse) => {
            this.alertService.showMessageConfigAlert('error', response.error.message)
            this.businessManagerForm.enable()
        })
    }


    saveQuotes(company: any) {
        if (this.quotesManagerForm.invalid) {
            return
        }

        let quotes1: Quotes = {
            rol: Roles.ROLE_AREA_MANAGER,
            quote: this.quotesManagerForm.value.quoteone
        }

        let quotes2: Quotes = {
            rol: Roles.ROLE_TEAM_LEADER,
            quote: this.quotesManagerForm.value.quotetwo
        }

        let quotes3: Quotes = {
            rol: Roles.ROLE_TASK_MANAGER,
            quote: this.quotesManagerForm.value.quotethree
        }

        let quotesManager: QuotesManagerModel = {
            companyId: company.data.id,
            quotes: [quotes1, quotes2, quotes3]
        }

        this._cryptoService.saveQuotesManager(quotesManager).subscribe(data => {
            this.quotesManagerForm.enable();
            this.quotesManagerForm.reset()
            this.dialogRef.close(true)
            this.alertService.showMessageConfigAlert('success', 'Registro creado')
        }, (response: HttpErrorResponse) => {
            this.alertService.showMessageConfigAlert('error', response.error.message)
            this.quotesManagerForm.enable()
        })
    }

}
