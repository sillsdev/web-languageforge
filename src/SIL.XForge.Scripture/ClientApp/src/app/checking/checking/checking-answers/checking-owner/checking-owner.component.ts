import { Component, Input, OnInit } from '@angular/core';
import { User } from 'xforge-common/models/user';
import { UserService } from 'xforge-common/user.service';

@Component({
  selector: 'app-checking-owner',
  templateUrl: './checking-owner.component.html',
  styleUrls: ['./checking-owner.component.scss']
})
export class CheckingOwnerComponent implements OnInit {
  @Input() ownerRef: string;
  @Input() includeAvatar: boolean = false;
  @Input() dateTime: Date = new Date(); // TODO: (NW) Today's date set for testing purposes - remove once date is in DB
  @Input() layoutStacked: boolean = false;
  owner: User = new User();

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.userService.onlineGet(this.ownerRef).subscribe(userData => {
      this.owner = userData.data;
    });
  }
}
