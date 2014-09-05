# download everything from http://www.abs.gov.au/AUSSTATS/abs@.nsf/DetailsPage/6530.02009-10?OpenDocument

import xlrd
from os import listdir
from os.path import isfile, join
import re

path = '/home/mikey/ABS/HSE/'

##states = ['act', 'nt', 'nsw', 'tas', 'qld', 'vic', 'sa', 'wa']
#onlyfiles = [ f for f in listdir(path) if isfile(join(path,f)) ]
#for file in onlyfiles:
#    result = re.match(r'(.*)_data_tables_2009-10.xls', file)
#    if result: 
#        print result.group(1)

from xlrd import open_workbook
wb = open_workbook(path+'65300do001_200910.xls')
for i,s in enumerate(wb.sheets()):
    print 'Sheet:',s.name,i%2
#    for row in range(s.nrows):
#        values = []
#        for col in range(s.ncols):
#            values.append(s.cell(row,col).value)
#            print ','.join(values)
#            print
#
