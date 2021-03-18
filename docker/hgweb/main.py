hgweb_config = b"/hgweb.config"

# enable demandloading to reduce startup time
from mercurial import demandimport; demandimport.enable()

from mercurial.hgweb import hgweb
app = hgweb(hgweb_config)
