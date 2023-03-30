import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of, switchMap, throwError } from 'rxjs';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { UserService } from 'app/core/user/user.service';
import { user } from 'app/mock-api/common/user/data';
import { User } from '../user/user.types';
import { AppSettings } from 'app/enviroments';
import { Router } from '@angular/router';

@Injectable()
export class AuthService {
    private _authenticated: boolean = false;

    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient,
        private _userService: UserService,
        private _router: Router,
    ) {
    }

    set accessToken(token: string) {
        localStorage.setItem('accessToken', token);
    }

    get accessToken(): string {
        return localStorage.getItem('accessToken') ?? '';
    }

    signIn(credentials: { username: string; password: string }): Observable<any> {

        if (this._authenticated) {
            this._router.navigateByUrl("/signed-in-redirect");
        }

        return this._httpClient.post(AppSettings.API_PATH.concat('/public/login'), credentials).pipe(
            switchMap((response: any) => {
                localStorage.setItem('user', JSON.stringify(response.user))
                localStorage.setItem('auth', JSON.stringify(true))
                this.accessToken = response.accessToken
                this._authenticated = true;
                this._userService.user = response.user;
                return of(response);
            })
        );
    }

    check(): Observable<boolean> {

        const user: User = JSON.parse(localStorage.getItem('user') || null)
        const auth: boolean = JSON.parse(localStorage.getItem('auth') || null)
        if (user == null || auth == null) {
            return of(false)
        }

        if (!this.accessToken) {
            return of(false);
        }

        if (AuthUtils.isTokenExpired(this.accessToken)) {
            return of(false)
        }

        this._userService.user = user
        this._authenticated = auth

        if (this._authenticated) {
            return of(true);
        }
    }

    forgotPassword(email: string): Observable<any> {
        return this._httpClient.get('api/public/v1/security/user/change/password?correo=' + email);
    }

    signOut(): Observable<any> {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('auth')
        localStorage.removeItem('user')
        this._authenticated = false;
        return of(true);
    }

    //TODO no se utilizara el registro de usuario en login
    signUp(user: { name: string; email: string; password: string; company: string }): Observable<any> {
        return this._httpClient.post('api/auth/sign-up', user);
    }

    unlockSession(credentials: { email: string; password: string }): Observable<any> {
        return this._httpClient.post('api/auth/unlock-session', credentials);
    }

    resetPassword(password: string): Observable<any> {
        return this._httpClient.post('api/auth/reset-password', password);
    }
}
