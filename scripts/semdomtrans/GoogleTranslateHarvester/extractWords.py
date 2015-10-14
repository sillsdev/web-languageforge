from lxml import etree
tree = etree.parse('../../../src/resources/languageforge/semdomtrans/SemDom_en.xml')
notags = etree.tostring(tree, encoding='utf8', method='text')
print(notags)
