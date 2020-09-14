import { Component } from '@angular/core';
import { User } from '../models/user.model';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { UsersService } from '../services/users.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent {
  dataSource = new MatTableDataSource<User>();
  columns = {
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email',
    username: 'Username',
    language: 'Lang Tag'
  };

  constructor(private readonly router: Router, private readonly users: UsersService) {
    this.users.getUsers().subscribe(result => this.dataSource.data = result);
  }

  itemSelected(user: User): void {
    this.router.navigateByUrl(`/admin/users/${user.username}`);
  }
}
