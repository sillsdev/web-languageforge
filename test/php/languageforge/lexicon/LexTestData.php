<?php

class LexTestData {
	
	public static function Import($mergeRule, $skipSameModTime = false) {
		$import= array();
		$import['file'] = array();
		$import['file']["webkitRelativePath"] = "";
		$import['file']["lastModifiedDate"] = "2014-03-07T03:34:13.000Z";
		$import['file']["name"] = "tha-food-small.lift";
		$import['file']["type"] = "";
		$import['file']["size"] = 6149;
		$import['file']["data"] = "data:;base64,77u/PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPGxpZnQKCXZlcnNpb249IjAuMTMiCglwcm9kdWNlcj0iV2VTYXkgMS4wLjAuMCI+Cgk8ZW50cnkKCQlpZD0iY2h1zIB1Y2hpzIBpIG11zIx1IHLJlMyCyZRwX2RkMTVjYmM0LTkwODUtNGQ2Ni1hZjNkLTg0MjhmMDc4YTdkYSIKCQlkYXRlQ3JlYXRlZD0iMjAwOC0xMS0wM1QwNjoxNzoyNFoiCgkJZGF0ZU1vZGlmaWVkPSIyMDExLTEwLTI2VDAxOjQxOjE5WiIKCQlndWlkPSJkZDE1Y2JjNC05MDg1LTRkNjYtYWYzZC04NDI4ZjA3OGE3ZGEiPgoJCTxsZXhpY2FsLXVuaXQ+CgkJCTxmb3JtCgkJCQlsYW5nPSJxYWEteC1JUEEiPgoJCQkJPHRleHQ+Y2h1zIB1Y2hpzIBpIG11zIx1IGtyyZTMgsmUcDwvdGV4dD4KCQkJPC9mb3JtPgoJCQk8Zm9ybQoJCQkJbGFuZz0ieC1JUEEiPgoJCQkJPHRleHQ+Y2h1zIB1Y2hpzIBpIG11zIx1IGtyyZTMgsmUcDwvdGV4dD4KCQkJPC9mb3JtPgoJCQk8Zm9ybQoJCQkJbGFuZz0idGgiPgoJCQkJPHRleHQ+4LiJ4Li54LmI4LiJ4Li14LmI4Lir4Lih4Li54LiB4Lij4Lit4LiaPC90ZXh0PgoJCQk8L2Zvcm0+CgkJPC9sZXhpY2FsLXVuaXQ+CgkJPGZpZWxkCgkJCXR5cGU9ImxpdGVyYWwtbWVhbmluZyI+CgkJCTxmb3JtCgkJCQlsYW5nPSJlbiI+CgkJCQk8dGV4dD5DaHVjaGkgY3VycnkgcG9yayBjcmlzcHk8L3RleHQ+CgkJCTwvZm9ybT4KCQk8L2ZpZWxkPgoJCTxzZW5zZQoJCQlpZD0iZGY4MDE4MzMtZDU1Yi00NDkyLWI1MDEtNjUwZGE3YmM3YjczIj4KCQkJPGRlZmluaXRpb24+CgkJCQk8Zm9ybQoJCQkJCWxhbmc9ImVuIj4KCQkJCQk8dGV4dD5BIGtpbmQgb2YgY3VycnkgZnJpZWQgd2l0aCBjcmlzcHkgcG9yazwvdGV4dD4KCQkJCTwvZm9ybT4KCQkJPC9kZWZpbml0aW9uPgoJCQk8aWxsdXN0cmF0aW9uCgkJCQlocmVmPSJJTUdfMDIxNC5KUEciIC8+CgkJPC9zZW5zZT4KCTwvZW50cnk+Cgk8ZW50cnkKCQlpZD0iSWQnZFByZW1hdHVyZWx5XzA1NDczY2IwLTQxNjUtNDkyMy04ZDgxLTAyZjhiOGVkM2YyNiIKCQlkYXRlQ3JlYXRlZD0iMjAwOC0xMC0wOVQwMjoxNToyM1oiCgkJZGF0ZU1vZGlmaWVkPSIyMDA4LTEwLTE3VDA2OjE2OjExWiIKCQlndWlkPSIwNTQ3M2NiMC00MTY1LTQ5MjMtOGQ4MS0wMmY4YjhlZDNmMjYiPgoJCTxsZXhpY2FsLXVuaXQ+CgkJCTxmb3JtCgkJCQlsYW5nPSJxYWEteC1JUEEiPgoJCQkJPHRleHQ+a2hhzIJhdyBrYcyAaSB0aMmUzILJlHQ8L3RleHQ+CgkJCTwvZm9ybT4KCQkJPGZvcm0KCQkJCWxhbmc9IngtSVBBIj4KCQkJCTx0ZXh0PmtoYcyCYXcga2HMgGkgdGjJlMyCyZR0PC90ZXh0PgoJCQk8L2Zvcm0+CgkJCTxmb3JtCgkJCQlsYW5nPSJ0aCI+CgkJCQk8dGV4dD7guILguYnguLLguKfguYTguIHguYjguJfguK3guJQ8L3RleHQ+CgkJCTwvZm9ybT4KCQk8L2xleGljYWwtdW5pdD4KCQk8c2Vuc2UKCQkJaWQ9ImY2MGJhMDQ3LWRmMGMtNDdjYy1hYmExLWFmNGVhMTAzMGUzMSI+CgkJCTxkZWZpbml0aW9uPgoJCQkJPGZvcm0KCQkJCQlsYW5nPSJlbiI+CgkJCQkJPHRleHQ+cGllY2VzIG9mIGZyaWVkIGNoaWNrZW4gc2VydmVkIG92ZXIgcmljZSwgdXN1YWxseSB3aXRoIGEgc3dlZXQgYW5kIHNwaWN5IHNhdWNlIG9uIHRoZSBzaWRlPC90ZXh0PgoJCQkJPC9mb3JtPgoJCQk8L2RlZmluaXRpb24+CgkJCTxpbGx1c3RyYXRpb24KCQkJCWhyZWY9IklNR18wMTg3LkpQRyIgLz4KCQk8L3NlbnNlPgoJCTxmaWVsZAoJCQl0eXBlPSJsaXRlcmFsLW1lYW5pbmciPgoJCQk8Zm9ybQoJCQkJbGFuZz0iZW4iPgoJCQkJPHRleHQ+cmljZSBjaGlja2VuIGZyaWVkPC90ZXh0PgoJCQk8L2Zvcm0+CgkJPC9maWVsZD4KCTwvZW50cnk+Cgk8ZW50cnkKCQlpZD0iSWQnZFByZW1hdHVyZWx5XzBhODMwZDIwLTA0Y2YtNDNhZS04NjkwLWQ5OTM2M2YzMTRiMSIKCQlkYXRlQ3JlYXRlZD0iMjAwOC0xMC0wOFQwNTo1OTowN1oiCgkJZGF0ZU1vZGlmaWVkPSIyMDEwLTEwLTA1VDA3OjU1OjEzWiIKCQlndWlkPSIwYTgzMGQyMC0wNGNmLTQzYWUtODY5MC1kOTkzNjNmMzE0YjEiPgoJCTxsZXhpY2FsLXVuaXQ+CgkJCTxmb3JtCgkJCQlsYW5nPSJxYWEteC1JUEEiPgoJCQkJPHRleHQ+a3JhcGHMgncgbXXMjHU8L3RleHQ+CgkJCTwvZm9ybT4KCQkJPGZvcm0KCQkJCWxhbmc9IngtSVBBIj4KCQkJCTx0ZXh0PmtyYXBhzIJ3IG11zIx1PC90ZXh0PgoJCQk8L2Zvcm0+CgkJCTxmb3JtCgkJCQlsYW5nPSJ0aCI+CgkJCQk8dGV4dD7guIHguKPguLDguYDguJ7guLLguKvguKHguLk8L3RleHQ+CgkJCTwvZm9ybT4KCQk8L2xleGljYWwtdW5pdD4KCQk8ZmllbGQKCQkJdHlwZT0ibGl0ZXJhbC1tZWFuaW5nIj4KCQkJPGZvcm0KCQkJCWxhbmc9ImVuIj4KCQkJCTx0ZXh0PmJhc2lsIHBvcms8L3RleHQ+CgkJCTwvZm9ybT4KCQk8L2ZpZWxkPgoJCTxzZW5zZQoJCQlpZD0iNDgzY2M3ZGYtOWY2YS00NmQ5LWFiMmItMzI5ZmEyNGQyN2E1Ij4KCQkJPGRlZmluaXRpb24+CgkJCQk8Zm9ybQoJCQkJCWxhbmc9ImVuIj4KCQkJCQk8dGV4dD5zdGlyIGZyaWVkIGJhc2lsIGFuZCBob3QgcGVwcGVycyB3aXRoIGdyb3VuZCBwb3JrIG92ZXIgcmljZTwvdGV4dD4KCQkJCTwvZm9ybT4KCQkJPC9kZWZpbml0aW9uPgoJCQk8ZXhhbXBsZT4KCQkJCTxmb3JtCgkJCQkJbGFuZz0icWFhLXgtdiI+CgkJCQkJPHRleHQ+bGE8L3RleHQ+CgkJCQk8L2Zvcm0+CgkJCTwvZXhhbXBsZT4KCQkJPGV4YW1wbGU+CgkJCQk8Zm9ybQoJCQkJCWxhbmc9IngtdiI+CgkJCQkJPHRleHQ+bGE8L3RleHQ+CgkJCQk8L2Zvcm0+CgkJCTwvZXhhbXBsZT4KCQkJPGlsbHVzdHJhdGlvbgoJCQkJaHJlZj0iSU1HXzAxODguSlBHIiAvPgoJCQk8ZmllbGQKCQkJCXR5cGU9IkNvbW1lbnQiPgoJCQkJPGZvcm0KCQkJCQlsYW5nPSJlbiI+CgkJCQkJPHRleHQ+VGhhaSBiYXNpbCBpbiBhbmQgb2YgaXQgc2VsZiBpcyBzb21ldGltZXMgYSBiaXQgc3BpY3kgYnkgd2VzdGVybiBzdGFuZGFyZHMgc28gZG9uJ3QgYmUgc3VycHJpc2VkIGlmIGEgdmVuZG9yIGxvb2tzIGF0IHlvdSBxdWl6aWNhbGx5IGlmIHlvdSBhc2sgZm9yICJtYcyCeSBwaGV0Ii48L3RleHQ+CgkJCQk8L2Zvcm0+CgkJCTwvZmllbGQ+CgkJPC9zZW5zZT4KCTwvZW50cnk+Cgk8ZW50cnkKCQlpZD0iSWQnZFByZW1hdHVyZWx5XzExOGJjZTE4LWE2YzUtNDlkMi1hNWUwLWE3NGNiMTM2NTE2OSIKCQlkYXRlQ3JlYXRlZD0iMjAwOC0xMC0xN1QwNjoyNzo1NloiCgkJZGF0ZU1vZGlmaWVkPSIyMDEyLTA1LTEzVDExOjU4OjU4WiIKCQlndWlkPSIxMThiY2UxOC1hNmM1LTQ5ZDItYTVlMC1hNzRjYjEzNjUxNjkiPgoJCTxsZXhpY2FsLXVuaXQ+CgkJCTxmb3JtCgkJCQlsYW5nPSJxYWEteC1JUEEiPgoJCQkJPHRleHQ+cGhhzIB0IHNpacqUIGnMjHcgbXXMjHU8L3RleHQ+CgkJCTwvZm9ybT4KCQkJPGZvcm0KCQkJCWxhbmc9IngtSVBBIj4KCQkJCTx0ZXh0PnBoYcyAdCBzaWnKlCBpzIx3IG11zIx1PC90ZXh0PgoJCQk8L2Zvcm0+CgkJCTxmb3JtCgkJCQlsYW5nPSJ0aCI+CgkJCQk8dGV4dD7guJzguLHguJTguIrguLXguK3guLTguYnguKfguKvguKHguLk8L3RleHQ+CgkJCTwvZm9ybT4KCQk8L2xleGljYWwtdW5pdD4KCQk8ZmllbGQKCQkJdHlwZT0ibGl0ZXJhbC1tZWFuaW5nIj4KCQkJPGZvcm0KCQkJCWxhbmc9ImVuIj4KCQkJCTx0ZXh0PmZyaWVkIHNveSBzYXVjZSBwb3JrPC90ZXh0PgoJCQk8L2Zvcm0+CgkJPC9maWVsZD4KCQk8c2Vuc2UKCQkJaWQ9IjhhMGI5MmYzLWU5NzMtNDYyZS04MzJmLTAzNzlmZWMxZDBmNCI+CgkJCTxkZWZpbml0aW9uPgoJCQkJPGZvcm0KCQkJCQlsYW5nPSJlbiI+CgkJCQkJPHRleHQ+Tm9vZGxlcyBmcmllZCBpbiBzb3kgc2F1Y2Ugd2l0aCBwb3JrPC90ZXh0PgoJCQkJPC9mb3JtPgoJCQk8L2RlZmluaXRpb24+CgkJPC9zZW5zZT4KCTwvZW50cnk+Cgk8ZW50cnkKCQlpZD0iSWQnZFByZW1hdHVyZWx5XzQzMTlkMzk1LWUwYmItNDBkZC05ODFjLTk1ZjgwNTllZjg1ZiIKCQlkYXRlQ3JlYXRlZD0iMjAwOC0xMC0xN1QwNjozNjowNloiCgkJZGF0ZU1vZGlmaWVkPSIyMDEwLTEwLTA1VDA3OjM0OjE5WiIKCQlndWlkPSI0MzE5ZDM5NS1lMGJiLTQwZGQtOTgxYy05NWY4MDU5ZWY4NWYiPgoJCTxsZXhpY2FsLXVuaXQ+CgkJCTxmb3JtCgkJCQlsYW5nPSJxYWEteC1JUEEiPgoJCQkJPHRleHQ+a2HMgGkgcGhhzIB0IG1lzIF0bWHMgG11zIBhxYs8L3RleHQ+CgkJCTwvZm9ybT4KCQkJPGZvcm0KCQkJCWxhbmc9IngtSVBBIj4KCQkJCTx0ZXh0PmthzIBpIHBoYcyAdCBtZcyBdG1hzIBtdcyAYcWLPC90ZXh0PgoJCQk8L2Zvcm0+CgkJCTxmb3JtCgkJCQlsYW5nPSJ0aCI+CgkJCQk8dGV4dD7guYTguIHguYjguJzguLHguJTguYDguKHguYfguJTguKHguLDguKHguYjguKfguIc8L3RleHQ+CgkJCTwvZm9ybT4KCQk8L2xleGljYWwtdW5pdD4KCQk8ZmllbGQKCQkJdHlwZT0ibGl0ZXJhbC1tZWFuaW5nIj4KCQkJPGZvcm0KCQkJCWxhbmc9ImVuIj4KCQkJCTx0ZXh0PkNoaWNrZW4gZnJpZWQgY2FzaGV3PC90ZXh0PgoJCQk8L2Zvcm0+CgkJPC9maWVsZD4KCQk8c2Vuc2UKCQkJaWQ9ImU2M2MxZDNhLWJkZmUtNGQ2ZC1hMGI1LWE5NGFiMDFhOGZjZCI+CgkJCTxkZWZpbml0aW9uPgoJCQkJPGZvcm0KCQkJCQlsYW5nPSJlbiI+CgkJCQkJPHRleHQ+U3RpciBmcmllZCBjaGlja2VuIHdpdGggY2FzaGV3czwvdGV4dD4KCQkJCTwvZm9ybT4KCQkJPC9kZWZpbml0aW9uPgoJCQk8ZXhhbXBsZT4KCQkJCTxmb3JtCgkJCQkJbGFuZz0icWFhLXgtdiI+CgkJCQkJPHRleHQ+bGE8L3RleHQ+CgkJCQk8L2Zvcm0+CgkJCTwvZXhhbXBsZT4KCQkJPGV4YW1wbGU+CgkJCQk8Zm9ybQoJCQkJCWxhbmc9IngtdiI+CgkJCQkJPHRleHQ+bGE8L3RleHQ+CgkJCQk8L2Zvcm0+CgkJCTwvZXhhbXBsZT4KCQkJPGlsbHVzdHJhdGlvbgoJCQkJaHJlZj0iSU1HXzAyMDcuSlBHIiAvPgoJCQk8dHJhaXQKCQkJCW5hbWU9InNlbWFudGljLWRvbWFpbi1kZHA0IgoJCQkJdmFsdWU9IjUuMiBGb29kIiAvPgoJCTwvc2Vuc2U+Cgk8L2VudHJ5PgoJPGVudHJ5CgkJaWQ9IklkJ2RQcmVtYXR1cmVseV83Y2NmNDAwYi03MzNhLTQ3NzQtYWRhOC1mZTMzMDhlNDA2ZDgiCgkJZGF0ZUNyZWF0ZWQ9IjIwMDgtMTAtMjJUMDY6MDA6MjRaIgoJCWRhdGVNb2RpZmllZD0iMjAxMi0wMi0xN1QwMzozMjoxMloiCgkJZ3VpZD0iN2NjZjQwMGItNzMzYS00Nzc0LWFkYTgtZmUzMzA4ZTQwNmQ4Ij4KCQk8bGV4aWNhbC11bml0PgoJCQk8Zm9ybQoJCQkJbGFuZz0icWFhLXgtSVBBIj4KCQkJCTx0ZXh0PmNlzIB0IGtodcyMbnPKicyAayBwaGHMgHQgcGhyacyAayBwaGHMjHc8L3RleHQ+CgkJCTwvZm9ybT4KCQkJPGZvcm0KCQkJCWxhbmc9IngtSVBBIj4KCQkJCTx0ZXh0PmNlzIB0IGtodcyMbnPKicyAayBwaGHMgHQgcGhyacyAayBwaGHMjHc8L3RleHQ+CgkJCTwvZm9ybT4KCQkJPGZvcm0KCQkJCWxhbmc9InRoIj4KCQkJCTx0ZXh0PuC5gOC4iOC5h+C4lOC4guC4uOC4meC4qOC4tuC4geC4nOC4seC4lOC4nOC4o+C4tOC4geC5gOC4nOC4sjwvdGV4dD4KCQkJPC9mb3JtPgoJCTwvbGV4aWNhbC11bml0PgoJCTxmaWVsZAoJCQl0eXBlPSJsaXRlcmFsLW1lYW5pbmciPgoJCQk8Zm9ybQoJCQkJbGFuZz0iZW4iPgoJCQkJPHRleHQ+c2V2ZW4gd2FybG9yZCBmcmllZCBwZXBwZXIgc2VhcmVkPC90ZXh0PgoJCQk8L2Zvcm0+CgkJPC9maWVsZD4KCQk8c2Vuc2UKCQkJaWQ9IjlkNTBlMDcyLTAyMDYtNDc3Ni05ZWU2LWJkZGY4OWI5NmFlZCI+CgkJCTxkZWZpbml0aW9uPgoJCQkJPGZvcm0KCQkJCQlsYW5nPSJlbiI+CgkJCQkJPHRleHQ+c2V2ZW4ga2luZHMgb2YgbWVhdCBmcmllZCBhbmQgc2VhcmVkIHdpdGggcGVwcGVyczwvdGV4dD4KCQkJCTwvZm9ybT4KCQkJPC9kZWZpbml0aW9uPgoJCQk8ZmllbGQKCQkJCXR5cGU9IkNvbW1lbnQiPgoJCQkJPGZvcm0KCQkJCQlsYW5nPSJlbiI+CgkJCQkJPHRleHQ+U3BlY2lhbHR5IGRpc2ggYXQgTm9rJ3MgbmVhciBQYXlhcCBVbml2ZXJzaXR5LiA3IGtpbmRzIG9mIG1lYXQuIFBvcmssIGNydW5jaHkgcG9yaywgZmVybWVudGVkIHBvcmsgc2F1c2FnZSwgc3F1aWQsIHNocmltcCwgYmVlZiBhbmQgY2hpY2tlbi48L3RleHQ+CgkJCQk8L2Zvcm0+CgkJCTwvZmllbGQ+CgkJPC9zZW5zZT4KCTwvZW50cnk+CjwvbGlmdD4=";
		$import['settings'] = array();
		$import['settings']['mergeRule'] = $mergeRule;
		$import['settings']['skipSameModTime'] = $skipSameModTime;
		return $import;
	}
/*

file {
"webkitRelativePath": "",
"lastModifiedDate": "2014-03-07T03:34:13.000Z",
"name": "tha-food-small.lift",
"type": "",
"size": 6149,
"data": "data:;base64,77u/PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPGxpZnQKCXZlcnNpb249IjAuMTMiCglwcm9kdWNlcj0iV2VTYXkgMS4wLjAuMCI+Cgk8ZW50cnkKCQlpZD0iY2h1zIB1Y2hpzIBpIG11zIx1IHLJlMyCyZRwX2RkMTVjYmM0LTkwODUtNGQ2Ni1hZjNkLTg0MjhmMDc4YTdkYSIKCQlkYXRlQ3JlYXRlZD0iMjAwOC0xMS0wM1QwNjoxNzoyNFoiCgkJZGF0ZU1vZGlmaWVkPSIyMDExLTEwLTI2VDAxOjQxOjE5WiIKCQlndWlkPSJkZDE1Y2JjNC05MDg1LTRkNjYtYWYzZC04NDI4ZjA3OGE3ZGEiPgoJCTxsZXhpY2FsLXVuaXQ+CgkJCTxmb3JtCgkJCQlsYW5nPSJxYWEteC1JUEEiPgoJCQkJPHRleHQ+Y2h1zIB1Y2hpzIBpIG11zIx1IGtyyZTMgsmUcDwvdGV4dD4KCQkJPC9mb3JtPgoJCQk8Zm9ybQoJCQkJbGFuZz0ieC1JUEEiPgoJCQkJPHRleHQ+Y2h1zIB1Y2hpzIBpIG11zIx1IGtyyZTMgsmUcDwvdGV4dD4KCQkJPC9mb3JtPgoJCQk8Zm9ybQoJCQkJbGFuZz0idGgiPgoJCQkJPHRleHQ+4LiJ4Li54LmI4LiJ4Li14LmI4Lir4Lih4Li54LiB4Lij4Lit4LiaPC90ZXh0PgoJCQk8L2Zvcm0+CgkJPC9sZXhpY2FsLXVuaXQ+CgkJPGZpZWxkCgkJCXR5cGU9ImxpdGVyYWwtbWVhbmluZyI+CgkJCTxmb3JtCgkJCQlsYW5nPSJlbiI+CgkJCQk8dGV4dD5DaHVjaGkgY3VycnkgcG9yayBjcmlzcHk8L3RleHQ+CgkJCTwvZm9ybT4KCQk8L2ZpZWxkPgoJCTxzZW5zZQoJCQlpZD0iZGY4MDE4MzMtZDU1Yi00NDkyLWI1MDEtNjUwZGE3YmM3YjczIj4KCQkJPGRlZmluaXRpb24+CgkJCQk8Zm9ybQoJCQkJCWxhbmc9ImVuIj4KCQkJCQk8dGV4dD5BIGtpbmQgb2YgY3VycnkgZnJpZWQgd2l0aCBjcmlzcHkgcG9yazwvdGV4dD4KCQkJCTwvZm9ybT4KCQkJPC9kZWZpbml0aW9uPgoJCQk8aWxsdXN0cmF0aW9uCgkJCQlocmVmPSJJTUdfMDIxNC5KUEciIC8+CgkJPC9zZW5zZT4KCTwvZW50cnk+Cgk8ZW50cnkKCQlpZD0iSWQnZFByZW1hdHVyZWx5XzA1NDczY2IwLTQxNjUtNDkyMy04ZDgxLTAyZjhiOGVkM2YyNiIKCQlkYXRlQ3JlYXRlZD0iMjAwOC0xMC0wOVQwMjoxNToyM1oiCgkJZGF0ZU1vZGlmaWVkPSIyMDA4LTEwLTE3VDA2OjE2OjExWiIKCQlndWlkPSIwNTQ3M2NiMC00MTY1LTQ5MjMtOGQ4MS0wMmY4YjhlZDNmMjYiPgoJCTxsZXhpY2FsLXVuaXQ+CgkJCTxmb3JtCgkJCQlsYW5nPSJxYWEteC1JUEEiPgoJCQkJPHRleHQ+a2hhzIJhdyBrYcyAaSB0aMmUzILJlHQ8L3RleHQ+CgkJCTwvZm9ybT4KCQkJPGZvcm0KCQkJCWxhbmc9IngtSVBBIj4KCQkJCTx0ZXh0PmtoYcyCYXcga2HMgGkgdGjJlMyCyZR0PC90ZXh0PgoJCQk8L2Zvcm0+CgkJCTxmb3JtCgkJCQlsYW5nPSJ0aCI+CgkJCQk8dGV4dD7guILguYnguLLguKfguYTguIHguYjguJfguK3guJQ8L3RleHQ+CgkJCTwvZm9ybT4KCQk8L2xleGljYWwtdW5pdD4KCQk8c2Vuc2UKCQkJaWQ9ImY2MGJhMDQ3LWRmMGMtNDdjYy1hYmExLWFmNGVhMTAzMGUzMSI+CgkJCTxkZWZpbml0aW9uPgoJCQkJPGZvcm0KCQkJCQlsYW5nPSJlbiI+CgkJCQkJPHRleHQ+cGllY2VzIG9mIGZyaWVkIGNoaWNrZW4gc2VydmVkIG92ZXIgcmljZSwgdXN1YWxseSB3aXRoIGEgc3dlZXQgYW5kIHNwaWN5IHNhdWNlIG9uIHRoZSBzaWRlPC90ZXh0PgoJCQkJPC9mb3JtPgoJCQk8L2RlZmluaXRpb24+CgkJCTxpbGx1c3RyYXRpb24KCQkJCWhyZWY9IklNR18wMTg3LkpQRyIgLz4KCQk8L3NlbnNlPgoJCTxmaWVsZAoJCQl0eXBlPSJsaXRlcmFsLW1lYW5pbmciPgoJCQk8Zm9ybQoJCQkJbGFuZz0iZW4iPgoJCQkJPHRleHQ+cmljZSBjaGlja2VuIGZyaWVkPC90ZXh0PgoJCQk8L2Zvcm0+CgkJPC9maWVsZD4KCTwvZW50cnk+Cgk8ZW50cnkKCQlpZD0iSWQnZFByZW1hdHVyZWx5XzBhODMwZDIwLTA0Y2YtNDNhZS04NjkwLWQ5OTM2M2YzMTRiMSIKCQlkYXRlQ3JlYXRlZD0iMjAwOC0xMC0wOFQwNTo1OTowN1oiCgkJZGF0ZU1vZGlmaWVkPSIyMDEwLTEwLTA1VDA3OjU1OjEzWiIKCQlndWlkPSIwYTgzMGQyMC0wNGNmLTQzYWUtODY5MC1kOTkzNjNmMzE0YjEiPgoJCTxsZXhpY2FsLXVuaXQ+CgkJCTxmb3JtCgkJCQlsYW5nPSJxYWEteC1JUEEiPgoJCQkJPHRleHQ+a3JhcGHMgncgbXXMjHU8L3RleHQ+CgkJCTwvZm9ybT4KCQkJPGZvcm0KCQkJCWxhbmc9IngtSVBBIj4KCQkJCTx0ZXh0PmtyYXBhzIJ3IG11zIx1PC90ZXh0PgoJCQk8L2Zvcm0+CgkJCTxmb3JtCgkJCQlsYW5nPSJ0aCI+CgkJCQk8dGV4dD7guIHguKPguLDguYDguJ7guLLguKvguKHguLk8L3RleHQ+CgkJCTwvZm9ybT4KCQk8L2xleGljYWwtdW5pdD4KCQk8ZmllbGQKCQkJdHlwZT0ibGl0ZXJhbC1tZWFuaW5nIj4KCQkJPGZvcm0KCQkJCWxhbmc9ImVuIj4KCQkJCTx0ZXh0PmJhc2lsIHBvcms8L3RleHQ+CgkJCTwvZm9ybT4KCQk8L2ZpZWxkPgoJCTxzZW5zZQoJCQlpZD0iNDgzY2M3ZGYtOWY2YS00NmQ5LWFiMmItMzI5ZmEyNGQyN2E1Ij4KCQkJPGRlZmluaXRpb24+CgkJCQk8Zm9ybQoJCQkJCWxhbmc9ImVuIj4KCQkJCQk8dGV4dD5zdGlyIGZyaWVkIGJhc2lsIGFuZCBob3QgcGVwcGVycyB3aXRoIGdyb3VuZCBwb3JrIG92ZXIgcmljZTwvdGV4dD4KCQkJCTwvZm9ybT4KCQkJPC9kZWZpbml0aW9uPgoJCQk8ZXhhbXBsZT4KCQkJCTxmb3JtCgkJCQkJbGFuZz0icWFhLXgtdiI+CgkJCQkJPHRleHQ+bGE8L3RleHQ+CgkJCQk8L2Zvcm0+CgkJCTwvZXhhbXBsZT4KCQkJPGV4YW1wbGU+CgkJCQk8Zm9ybQoJCQkJCWxhbmc9IngtdiI+CgkJCQkJPHRleHQ+bGE8L3RleHQ+CgkJCQk8L2Zvcm0+CgkJCTwvZXhhbXBsZT4KCQkJPGlsbHVzdHJhdGlvbgoJCQkJaHJlZj0iSU1HXzAxODguSlBHIiAvPgoJCQk8ZmllbGQKCQkJCXR5cGU9IkNvbW1lbnQiPgoJCQkJPGZvcm0KCQkJCQlsYW5nPSJlbiI+CgkJCQkJPHRleHQ+VGhhaSBiYXNpbCBpbiBhbmQgb2YgaXQgc2VsZiBpcyBzb21ldGltZXMgYSBiaXQgc3BpY3kgYnkgd2VzdGVybiBzdGFuZGFyZHMgc28gZG9uJ3QgYmUgc3VycHJpc2VkIGlmIGEgdmVuZG9yIGxvb2tzIGF0IHlvdSBxdWl6aWNhbGx5IGlmIHlvdSBhc2sgZm9yICJtYcyCeSBwaGV0Ii48L3RleHQ+CgkJCQk8L2Zvcm0+CgkJCTwvZmllbGQ+CgkJPC9zZW5zZT4KCTwvZW50cnk+Cgk8ZW50cnkKCQlpZD0iSWQnZFByZW1hdHVyZWx5XzExOGJjZTE4LWE2YzUtNDlkMi1hNWUwLWE3NGNiMTM2NTE2OSIKCQlkYXRlQ3JlYXRlZD0iMjAwOC0xMC0xN1QwNjoyNzo1NloiCgkJZGF0ZU1vZGlmaWVkPSIyMDEyLTA1LTEzVDExOjU4OjU4WiIKCQlndWlkPSIxMThiY2UxOC1hNmM1LTQ5ZDItYTVlMC1hNzRjYjEzNjUxNjkiPgoJCTxsZXhpY2FsLXVuaXQ+CgkJCTxmb3JtCgkJCQlsYW5nPSJxYWEteC1JUEEiPgoJCQkJPHRleHQ+cGhhzIB0IHNpacqUIGnMjHcgbXXMjHU8L3RleHQ+CgkJCTwvZm9ybT4KCQkJPGZvcm0KCQkJCWxhbmc9IngtSVBBIj4KCQkJCTx0ZXh0PnBoYcyAdCBzaWnKlCBpzIx3IG11zIx1PC90ZXh0PgoJCQk8L2Zvcm0+CgkJCTxmb3JtCgkJCQlsYW5nPSJ0aCI+CgkJCQk8dGV4dD7guJzguLHguJTguIrguLXguK3guLTguYnguKfguKvguKHguLk8L3RleHQ+CgkJCTwvZm9ybT4KCQk8L2xleGljYWwtdW5pdD4KCQk8ZmllbGQKCQkJdHlwZT0ibGl0ZXJhbC1tZWFuaW5nIj4KCQkJPGZvcm0KCQkJCWxhbmc9ImVuIj4KCQkJCTx0ZXh0PmZyaWVkIHNveSBzYXVjZSBwb3JrPC90ZXh0PgoJCQk8L2Zvcm0+CgkJPC9maWVsZD4KCQk8c2Vuc2UKCQkJaWQ9IjhhMGI5MmYzLWU5NzMtNDYyZS04MzJmLTAzNzlmZWMxZDBmNCI+CgkJCTxkZWZpbml0aW9uPgoJCQkJPGZvcm0KCQkJCQlsYW5nPSJlbiI+CgkJCQkJPHRleHQ+Tm9vZGxlcyBmcmllZCBpbiBzb3kgc2F1Y2Ugd2l0aCBwb3JrPC90ZXh0PgoJCQkJPC9mb3JtPgoJCQk8L2RlZmluaXRpb24+CgkJPC9zZW5zZT4KCTwvZW50cnk+Cgk8ZW50cnkKCQlpZD0iSWQnZFByZW1hdHVyZWx5XzQzMTlkMzk1LWUwYmItNDBkZC05ODFjLTk1ZjgwNTllZjg1ZiIKCQlkYXRlQ3JlYXRlZD0iMjAwOC0xMC0xN1QwNjozNjowNloiCgkJZGF0ZU1vZGlmaWVkPSIyMDEwLTEwLTA1VDA3OjM0OjE5WiIKCQlndWlkPSI0MzE5ZDM5NS1lMGJiLTQwZGQtOTgxYy05NWY4MDU5ZWY4NWYiPgoJCTxsZXhpY2FsLXVuaXQ+CgkJCTxmb3JtCgkJCQlsYW5nPSJxYWEteC1JUEEiPgoJCQkJPHRleHQ+a2HMgGkgcGhhzIB0IG1lzIF0bWHMgG11zIBhxYs8L3RleHQ+CgkJCTwvZm9ybT4KCQkJPGZvcm0KCQkJCWxhbmc9IngtSVBBIj4KCQkJCTx0ZXh0PmthzIBpIHBoYcyAdCBtZcyBdG1hzIBtdcyAYcWLPC90ZXh0PgoJCQk8L2Zvcm0+CgkJCTxmb3JtCgkJCQlsYW5nPSJ0aCI+CgkJCQk8dGV4dD7guYTguIHguYjguJzguLHguJTguYDguKHguYfguJTguKHguLDguKHguYjguKfguIc8L3RleHQ+CgkJCTwvZm9ybT4KCQk8L2xleGljYWwtdW5pdD4KCQk8ZmllbGQKCQkJdHlwZT0ibGl0ZXJhbC1tZWFuaW5nIj4KCQkJPGZvcm0KCQkJCWxhbmc9ImVuIj4KCQkJCTx0ZXh0PkNoaWNrZW4gZnJpZWQgY2FzaGV3PC90ZXh0PgoJCQk8L2Zvcm0+CgkJPC9maWVsZD4KCQk8c2Vuc2UKCQkJaWQ9ImU2M2MxZDNhLWJkZmUtNGQ2ZC1hMGI1LWE5NGFiMDFhOGZjZCI+CgkJCTxkZWZpbml0aW9uPgoJCQkJPGZvcm0KCQkJCQlsYW5nPSJlbiI+CgkJCQkJPHRleHQ+U3RpciBmcmllZCBjaGlja2VuIHdpdGggY2FzaGV3czwvdGV4dD4KCQkJCTwvZm9ybT4KCQkJPC9kZWZpbml0aW9uPgoJCQk8ZXhhbXBsZT4KCQkJCTxmb3JtCgkJCQkJbGFuZz0icWFhLXgtdiI+CgkJCQkJPHRleHQ+bGE8L3RleHQ+CgkJCQk8L2Zvcm0+CgkJCTwvZXhhbXBsZT4KCQkJPGV4YW1wbGU+CgkJCQk8Zm9ybQoJCQkJCWxhbmc9IngtdiI+CgkJCQkJPHRleHQ+bGE8L3RleHQ+CgkJCQk8L2Zvcm0+CgkJCTwvZXhhbXBsZT4KCQkJPGlsbHVzdHJhdGlvbgoJCQkJaHJlZj0iSU1HXzAyMDcuSlBHIiAvPgoJCQk8dHJhaXQKCQkJCW5hbWU9InNlbWFudGljLWRvbWFpbi1kZHA0IgoJCQkJdmFsdWU9IjUuMiBGb29kIiAvPgoJCTwvc2Vuc2U+Cgk8L2VudHJ5PgoJPGVudHJ5CgkJaWQ9IklkJ2RQcmVtYXR1cmVseV83Y2NmNDAwYi03MzNhLTQ3NzQtYWRhOC1mZTMzMDhlNDA2ZDgiCgkJZGF0ZUNyZWF0ZWQ9IjIwMDgtMTAtMjJUMDY6MDA6MjRaIgoJCWRhdGVNb2RpZmllZD0iMjAxMi0wMi0xN1QwMzozMjoxMloiCgkJZ3VpZD0iN2NjZjQwMGItNzMzYS00Nzc0LWFkYTgtZmUzMzA4ZTQwNmQ4Ij4KCQk8bGV4aWNhbC11bml0PgoJCQk8Zm9ybQoJCQkJbGFuZz0icWFhLXgtSVBBIj4KCQkJCTx0ZXh0PmNlzIB0IGtodcyMbnPKicyAayBwaGHMgHQgcGhyacyAayBwaGHMjHc8L3RleHQ+CgkJCTwvZm9ybT4KCQkJPGZvcm0KCQkJCWxhbmc9IngtSVBBIj4KCQkJCTx0ZXh0PmNlzIB0IGtodcyMbnPKicyAayBwaGHMgHQgcGhyacyAayBwaGHMjHc8L3RleHQ+CgkJCTwvZm9ybT4KCQkJPGZvcm0KCQkJCWxhbmc9InRoIj4KCQkJCTx0ZXh0PuC5gOC4iOC5h+C4lOC4guC4uOC4meC4qOC4tuC4geC4nOC4seC4lOC4nOC4o+C4tOC4geC5gOC4nOC4sjwvdGV4dD4KCQkJPC9mb3JtPgoJCTwvbGV4aWNhbC11bml0PgoJCTxmaWVsZAoJCQl0eXBlPSJsaXRlcmFsLW1lYW5pbmciPgoJCQk8Zm9ybQoJCQkJbGFuZz0iZW4iPgoJCQkJPHRleHQ+c2V2ZW4gd2FybG9yZCBmcmllZCBwZXBwZXIgc2VhcmVkPC90ZXh0PgoJCQk8L2Zvcm0+CgkJPC9maWVsZD4KCQk8c2Vuc2UKCQkJaWQ9IjlkNTBlMDcyLTAyMDYtNDc3Ni05ZWU2LWJkZGY4OWI5NmFlZCI+CgkJCTxkZWZpbml0aW9uPgoJCQkJPGZvcm0KCQkJCQlsYW5nPSJlbiI+CgkJCQkJPHRleHQ+c2V2ZW4ga2luZHMgb2YgbWVhdCBmcmllZCBhbmQgc2VhcmVkIHdpdGggcGVwcGVyczwvdGV4dD4KCQkJCTwvZm9ybT4KCQkJPC9kZWZpbml0aW9uPgoJCQk8ZmllbGQKCQkJCXR5cGU9IkNvbW1lbnQiPgoJCQkJPGZvcm0KCQkJCQlsYW5nPSJlbiI+CgkJCQkJPHRleHQ+U3BlY2lhbHR5IGRpc2ggYXQgTm9rJ3MgbmVhciBQYXlhcCBVbml2ZXJzaXR5LiA3IGtpbmRzIG9mIG1lYXQuIFBvcmssIGNydW5jaHkgcG9yaywgZmVybWVudGVkIHBvcmsgc2F1c2FnZSwgc3F1aWQsIHNocmltcCwgYmVlZiBhbmQgY2hpY2tlbi48L3RleHQ+CgkJCQk8L2Zvcm0+CgkJCTwvZmllbGQ+CgkJPC9zZW5zZT4KCTwvZW50cnk+CjwvbGlmdD4="
}

*/
		
	public static function ImportSettings($import, $mergeRule, $skipSameModTime = false) {
		$import['settings']['mergeRule'] = $mergeRule;
		$import['settings']['skipSameModTime'] = $skipSameModTime;
		return $import;
	}
	
	// has incorrect th-fonipa form in each entry
	const liftTwoEntriesV0_13 = <<<EOD
<?xml version="1.0" encoding="utf-8"?>
<lift
	version="0.13"
	producer="WeSay 1.0.0.0">
	<entry
		id="chùuchìi mǔu rɔ̂ɔp_dd15cbc4-9085-4d66-af3d-8428f078a7da"
		dateCreated="2008-11-03T06:17:24Z"
		dateModified="2011-10-26T01:41:19Z"
		guid="dd15cbc4-9085-4d66-af3d-8428f078a7da">
		<lexical-unit>
			<form
				lang="th-fonipa">
				<text>chùuchìi mǔu krɔ̂ɔp</text>
			</form>
			<form
				lang="th">
				<text>ฉู่ฉี่หมูกรอบ</text>
			</form>
		</lexical-unit>
		<field
			type="literal-meaning">
			<form
				lang="en">
				<text>Chuchi curry pork crispy</text>
			</form>
		</field>
		<sense
			id="df801833-d55b-4492-b501-650da7bc7b73">
			<definition>
				<form
					lang="en">
					<text>A kind of curry fried with crispy pork</text>
				</form>
			</definition>
			<example>
				<form
					lang="th-fonipa">
					<text>sentence1</text>
				</form>
			</example>
			<example>
				<form
					lang="th-fonipa">
					<text>sentence2</text>
				</form>
			</example>
			<illustration
				href="IMG_0214.JPG" />
			<trait
				name="semantic-domain-ddp4"
				value="5.2 Food" />
		</sense>
	</entry>
	<entry
		id="Id'dPrematurely_05473cb0-4165-4923-8d81-02f8b8ed3f26"
		dateCreated="2008-10-09T02:15:23Z"
		dateModified="2008-10-17T06:16:11Z"
		guid="05473cb0-4165-4923-8d81-02f8b8ed3f26">
		<lexical-unit>
			<form
				lang="th-fonipa">
				<text>khâaw kài thɔ̀ɔt</text>
			</form>
			<form
				lang="th">
				<text>ข้าวไก่ทอด</text>
			</form>
		</lexical-unit>
		<sense
			id="f60ba047-df0c-47cc-aba1-af4ea1030e31">
			<definition>
				<form
					lang="en">
					<text>pieces of fried chicken served over rice, usually with a sweet and spicy sauce on the side</text>
				</form>
			</definition>
			<illustration
				href="IMG_0187.JPG" />
		</sense>
		<field
			type="literal-meaning">
			<form
				lang="en">
				<text>rice chicken fried</text>
			</form>
		</field>
	</entry>
</lift>
EOD;
	
	// has correct th-fonipa form in each entry
	const liftTwoEntriesCorrectedV0_13 = <<<EOD
<?xml version="1.0" encoding="utf-8"?>
<lift
	version="0.13"
	producer="WeSay 1.0.0.0">
	<entry
		id="chùuchìi mǔu rɔ̂ɔp_dd15cbc4-9085-4d66-af3d-8428f078a7da"
		dateCreated="2008-11-03T06:17:24Z"
		dateModified="2011-10-26T01:41:19Z"
		guid="dd15cbc4-9085-4d66-af3d-8428f078a7da">
		<lexical-unit>
			<form
				lang="th-fonipa">
				<text>chùuchìi mǔu krɔ̀ɔp</text>
			</form>
			<form
				lang="th">
				<text>ฉู่ฉี่หมูกรอบ</text>
			</form>
		</lexical-unit>
	</entry>
	<entry
		id="Id'dPrematurely_05473cb0-4165-4923-8d81-02f8b8ed3f26"
		dateCreated="2008-10-09T02:15:23Z"
		dateModified="2008-10-17T06:16:11Z"
		guid="05473cb0-4165-4923-8d81-02f8b8ed3f26">
		<lexical-unit>
			<form
				lang="th-fonipa">
				<text>khâaw kài thɔ̂ɔt</text>
			</form>
			<form
				lang="th">
				<text>ข้าวไก่ทอด</text>
			</form>
		</lexical-unit>
	</entry>
</lift>
EOD;
	
	// has correct th-fonipa form in each entry and mod date changed
	const liftTwoEntriesModifiedV0_13 = <<<EOD
<?xml version="1.0" encoding="utf-8"?>
<lift
	version="0.13"
	producer="WeSay 1.0.0.0">
	<entry
		id="chùuchìi mǔu rɔ̂ɔp_dd15cbc4-9085-4d66-af3d-8428f078a7da"
		dateCreated="2008-11-03T06:17:24Z"
		dateModified="2013-10-26T01:41:19Z"
		guid="dd15cbc4-9085-4d66-af3d-8428f078a7da">
		<lexical-unit>
			<form
				lang="th-fonipa">
				<text>chùuchìi mǔu krɔ̀ɔp</text>
			</form>
			<form
				lang="th">
				<text>ฉู่ฉี่หมูกรอบ</text>
			</form>
		</lexical-unit>
	</entry>
	<entry
		id="Id'dPrematurely_05473cb0-4165-4923-8d81-02f8b8ed3f26"
		dateCreated="2008-10-09T02:15:23Z"
		dateModified="2013-10-17T06:16:11Z"
		guid="05473cb0-4165-4923-8d81-02f8b8ed3f26">
		<lexical-unit>
			<form
				lang="th-fonipa">
				<text>khâaw kài thɔ̂ɔt</text>
			</form>
			<form
				lang="th">
				<text>ข้าวไก่ทอด</text>
			</form>
		</lexical-unit>
	</entry>
</lift>
EOD;
	
	const liftOneEntryV0_12 = <<<EOD
<?xml version="1.0" encoding="utf-8"?>
<lift
	version="0.12"
	producer="WeSay 1.0.0.0">
	<entry
		id="chùuchìi mǔu rɔ̂ɔp_dd15cbc4-9085-4d66-af3d-8428f078a7da"
		dateCreated="2008-11-03T06:17:24Z"
		dateModified="2011-10-26T01:41:19Z"
		guid="dd15cbc4-9085-4d66-af3d-8428f078a7da">
		<lexical-unit>
			<form
				lang="th-fonipa">
				<text>chùuchìi mǔu krɔ̂ɔp</text>
			</form>
		</lexical-unit>
	</entry>
</lift>
EOD;
	
	const liftInvalidAttribute = <<<EOD
<?xml version="1.0" encoding="utf-8"?>
<lift
	version="0.13"
	producer="WeSay 1.0.0.0">
	<entry
		xXxXx = "invalidAttribute"
		id="chùuchìi mǔu rɔ̂ɔp_dd15cbc4-9085-4d66-af3d-8428f078a7da"
		dateCreated="2008-11-03T06:17:24Z"
		dateModified="2011-10-26T01:41:19Z"
		guid="dd15cbc4-9085-4d66-af3d-8428f078a7da">
		<lexical-unit>
			<form
				lang="th-fonipa">
				<text>chùuchìi mǔu krɔ̂ɔp</text>
			</form>
		</lexical-unit>
	</entry>
</lift>
EOD;
	
}

