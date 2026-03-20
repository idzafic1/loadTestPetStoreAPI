/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 99.40397350993378, "KoPercent": 0.5960264900662252};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.883774834437086, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9, 500, 1500, "[Smoke] GET Pets Available"], "isController": false}, {"data": [0.95, 500, 1500, "[Stress] GET Pets Pending"], "isController": false}, {"data": [0.9333333333333333, 500, 1500, "[Endurance] GET Pets"], "isController": false}, {"data": [0.9733333333333334, 500, 1500, "[Stress] POST Create Pet"], "isController": false}, {"data": [0.9733333333333334, 500, 1500, "[Endurance] GET Inventory"], "isController": false}, {"data": [0.97, 500, 1500, "[Stress] GET Pets Sold"], "isController": false}, {"data": [0.3433333333333333, 500, 1500, "[Stress] GET Pets Available"], "isController": false}, {"data": [0.9866666666666667, 500, 1500, "[Endurance] POST Order"], "isController": false}, {"data": [0.9666666666666667, 500, 1500, "[Stress] GET Store Inventory"], "isController": false}, {"data": [0.75, 500, 1500, "[Spike] GET Pets Available"], "isController": false}, {"data": [0.9866666666666667, 500, 1500, "[Spike] GET Store Inventory"], "isController": false}, {"data": [1.0, 500, 1500, "[Smoke] GET Store Inventory"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1510, 9, 0.5960264900662252, 503.30331125827814, 376, 2049, 404.0, 784.8000000000002, 1437.9, 1599.2300000000007, 31.207374033811433, 456.7496804667156, 5.598997353315008], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["[Smoke] GET Pets Available", 5, 0, 0.0, 425.6, 386, 536, 398.0, 536.0, 536.0, 536.0, 0.6455777921239509, 0.20993887185280827, 0.09834974176888316], "isController": false}, {"data": ["[Stress] GET Pets Pending", 150, 2, 1.3333333333333333, 413.8599999999999, 381, 736, 400.0, 447.5000000000001, 537.45, 641.6500000000017, 3.478018920422927, 8.856381186526155, 0.5128719306483027], "isController": false}, {"data": ["[Endurance] GET Pets", 150, 0, 0.0, 430.1333333333334, 376, 798, 400.5, 536.5, 602.0, 795.45, 5.586176076269925, 1.8165982748026217, 0.8510190116192462], "isController": false}, {"data": ["[Stress] POST Create Pet", 150, 0, 0.0, 413.62666666666644, 378, 845, 403.0, 443.9, 520.05, 687.9200000000028, 3.4629236309908578, 1.707180768942192, 1.2776970764267244], "isController": false}, {"data": ["[Endurance] GET Inventory", 150, 0, 0.0, 425.2599999999999, 381, 966, 399.0, 449.0, 512.3499999999999, 963.45, 5.629785317519892, 2.2759213495533706, 0.7422080252589701], "isController": false}, {"data": ["[Stress] GET Pets Sold", 150, 1, 0.6666666666666666, 415.02000000000004, 380, 957, 401.0, 432.8, 489.5999999999997, 954.96, 3.4808437565265824, 8.112042921704221, 0.5030906991854825], "isController": false}, {"data": ["[Stress] GET Pets Available", 150, 3, 2.0, 1238.9799999999993, 417, 2049, 1438.0, 1599.3, 1624.25, 2027.0700000000004, 3.4317875037177696, 479.2339767696584, 0.5127573125672058], "isController": false}, {"data": ["[Endurance] POST Order", 150, 0, 0.0, 410.1866666666667, 379, 796, 399.0, 435.9, 449.9, 711.3400000000015, 5.636554937622125, 2.4379934921276116, 1.6123262649368706], "isController": false}, {"data": ["[Stress] GET Store Inventory", 150, 2, 1.3333333333333333, 405.2800000000001, 378, 527, 396.5, 428.8, 453.45, 525.98, 3.4675666928660593, 1.4013619951800822, 0.4571499057977715], "isController": false}, {"data": ["[Spike] GET Pets Available", 150, 0, 0.0, 478.4933333333334, 379, 748, 496.0, 565.8, 578.3499999999999, 706.6900000000007, 13.294336612603031, 4.323255949215635, 2.025309093326243], "isController": false}, {"data": ["[Spike] GET Store Inventory", 150, 1, 0.6666666666666666, 408.19333333333327, 386, 504, 399.0, 436.9, 452.24999999999994, 504.0, 13.591881116346501, 5.493739239760783, 1.7918983893620877], "isController": false}, {"data": ["[Smoke] GET Store Inventory", 5, 0, 0.0, 401.0, 393, 422, 396.0, 422.0, 422.0, 422.0, 0.6578081831337982, 0.26582131462965397, 0.08672275851861597], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["500/Server Error", 9, 100.0, 0.5960264900662252], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1510, 9, "500/Server Error", 9, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": ["[Stress] GET Pets Pending", 150, 2, "500/Server Error", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["[Stress] GET Pets Sold", 150, 1, "500/Server Error", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["[Stress] GET Pets Available", 150, 3, "500/Server Error", 3, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["[Stress] GET Store Inventory", 150, 2, "500/Server Error", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["[Spike] GET Store Inventory", 150, 1, "500/Server Error", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
