import csv

reader=csv.reader(open('suburbs.csv', 'r'), delimiter=',')
writer=csv.writer(open('suburbsR.csv', 'w'), delimiter=',')

lastnames = set()
for row in reader:
    if row[0] not in lastnames:
        writer.writerow(row)
        lastnames.add( row[0] )
