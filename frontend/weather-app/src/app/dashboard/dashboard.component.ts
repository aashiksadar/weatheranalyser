import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  // Define properties to store the data
  weatherData: any[] = [
    {'city': 'Mumbai', 'temperature': '28', 'label': 'Moderate'},
    {'city': 'Bengaluru', 'temperature': '29', 'label': 'High'},
    {'city': 'Kochi', 'temperature': '31', 'label': 'Very high'},
  ];

  constructor(private http: HttpClient) {
    console.log('DashboardComponent constructor called');
  }

  ngOnInit(): void {
    // Fetch data from the /api/weather endpoint
   // this.http.get<any[]>('http://localhost:8001/api/weather').subscribe(data => {
    //  this.weatherData = data;
    //});
  }
}
