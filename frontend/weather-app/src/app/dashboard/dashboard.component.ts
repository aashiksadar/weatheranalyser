import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  // Define properties to store the data
  weatherData: any[] = [
  ];

  constructor(private http: HttpClient, private router: Router) {
    console.log('DashboardComponent constructor called');
  }

  populateWeather():void {
    const cities = ['Mumbai', 'Bengaluru', 'Kochi', 'Moscow']
    const weatherData = [];

    const token = localStorage.getItem('token');

    cities.forEach((city) => {
      const headers = {
        Authorization: `Bearer ${token}`,
      };
      this.http.get(`http://localhost:8001/api/weather?city=${city}`, { headers }).subscribe((response) => {
        console.log({response});
        this.weatherData.push({city: `${city}`, ...response});
      });
    });
  }

  logout(): void {
    localStorage.removeItem('token');

    this.router.navigate(['/login']);
  }

  ngOnInit(): void {
    this.populateWeather();
  }
}
