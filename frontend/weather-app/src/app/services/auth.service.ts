import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private authUrl = 'http://localhost:8000/authenticate';

  constructor(private http: HttpClient) {}

  authenticate(username: string, password: string): Observable<any> {
    const credentials = { username, password };
    return this.http.post(this.authUrl, credentials);
  }
  login(username: string, password: string): Observable<any> {
    // Create a request body with the provided username and password
    const body = { username, password };

    // Send a POST request to the authentication endpoint
    return this.http.post(this.authUrl, body);
  }
  logout(): void {
    // Implement the logout logic here (e.g., clearing session)
  }
}
