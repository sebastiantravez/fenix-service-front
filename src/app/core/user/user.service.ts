import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, of, ReplaySubject, tap } from 'rxjs';
import { User } from 'app/core/user/user.types';

@Injectable({
    providedIn: 'root'
})
export class UserService
{
    private _user: ReplaySubject<User> = new ReplaySubject<User>(1);

    constructor(private _httpClient: HttpClient)
    {
    }

    set user(value: User) {
        this._user.next(value);
    }

    get user$(): Observable<User> {
        return this._user.asObservable();
    }

}
