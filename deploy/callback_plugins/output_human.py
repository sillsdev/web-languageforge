#FIELDS = ['cmd', 'command', 'start', 'end', 'delta', 'msg', 'stdout', 'stderr']
FIELDS = ['diff', 'stdout', 'stderr']
 
def output_human(res):
 
    if type(res) == type(dict()):
        for field in FIELDS:
            if field in res.keys():
                if res[field]:
                    if field == 'diff':
                        # use default encoding, check out sys.setdefaultencoding
                        print u'Difference:\n{1}'.format(field, res[field])
                        # or use specific encoding, e.g. utf-8
                        #print '\n{0}:\n{1}'.format(field, res[field].encode('utf-8'))
                    else:
                        if '\n' in res[field]:
                            print u'{0}:\n{1}'.format(field, res[field])
                        else:
                            # use default encoding, check out sys.setdefaultencoding
                            print u'{0}: {1}'.format(field, res[field])
                            # or use specific encoding, e.g. utf-8
                            #print '\n{0}:\n{1}'.format(field, res[field].encode('utf-8'))
 
class CallbackModule(object):
 
	def on_any(self, *args, **kwargs):
		pass
 
	def runner_on_failed(self, host, res, ignore_errors=False):
		output_human(res)
 
	def runner_on_ok(self, host, res):
		output_human(res)
 
	def runner_on_error(self, host, msg):
		pass
 
	def runner_on_skipped(self, host, item=None):
		pass
 
	def runner_on_unreachable(self, host, res):
		output_human(res)
 
	def runner_on_no_hosts(self):
		pass
 
	def runner_on_async_poll(self, host, res, jid, clock):
		output_human(res)
 
	def runner_on_async_ok(self, host, res, jid):
		output_human(res)
 
	def runner_on_async_failed(self, host, res, jid):
		output_human(res)
 
	def playbook_on_start(self):
		pass
 
	def playbook_on_notify(self, host, handler):
		pass
 
	def playbook_on_no_hosts_matched(self):
		pass
 
	def playbook_on_no_hosts_remaining(self):
		pass
 
	def playbook_on_task_start(self, name, is_conditional):
		pass
 
	def playbook_on_vars_prompt(self, varname, private=True, prompt=None, encrypt=None, confirm=False, salt_size=None, salt=None, default=None):
		pass
 
	def playbook_on_setup(self):
		pass
 
	def playbook_on_import_for_host(self, host, imported_file):
		pass
 
	def playbook_on_not_import_for_host(self, host, missing_file):
		pass
 
	def playbook_on_play_start(self, pattern):
		pass
 
	def playbook_on_stats(self, stats):
		pass
