import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-open-id-sign-up',
  templateUrl: './open-id-sign-up.component.html',
  styleUrls: ['./open-id-sign-up.component.scss']
})
export class OpenIdSignUpComponent implements OnInit {
  userName: string;
  emailId: string;
  picture: any;

  constructor(private readonly activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      this.userName = params['name'] as string;
      this.emailId = params['email'] as string;
      this.picture = params['picture'] as string;
    });
  }

  async submit(): Promise<void> {}
}
