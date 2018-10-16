import { async, inject, TestBed } from '@angular/core/testing';
import { timer } from 'rxjs';

import { Notice, NoticeService } from './notice.service';


describe('NoticeService', () => {

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [NoticeService]
        });
    });

    it('should create service', inject([NoticeService], (noticeService: NoticeService) => {
        expect(noticeService).toBeTruthy();
    }));

    it('should be able to close a notice', inject([NoticeService], (noticeService: NoticeService) => {
        noticeService.push(NoticeService.WARN, 'Close this warning notice');
        const id: string = noticeService.get()[0].id;
        expect(noticeService.get().length).toEqual(1);
        noticeService.removeById(id);
        expect(noticeService.get().length).toEqual(0);
    }));

    it('should remove a notice by its id', inject([NoticeService], (noticeService: NoticeService) => {
        const id1 = noticeService.push(NoticeService.WARN, 'Close this warning notice 1');
        const id2 = noticeService.push(NoticeService.WARN, 'Close this warning notice 2');
        noticeService.removeById(id1);
        expect(noticeService.get().length).toEqual(1);
        expect(noticeService.get()[0].id).toEqual(id2);

    }));

    it('should remove a notice by its index', inject([NoticeService], (noticeService: NoticeService) => {
        const id1 = noticeService.push(NoticeService.WARN, 'Close this warning notice 1');
        const id2 = noticeService.push(NoticeService.WARN, 'Close this warning notice 2');
        noticeService.remove(0);
        expect(noticeService.get().length).toEqual(1);
        expect(noticeService.get()[0].id).toEqual(id2);
    }));
});
