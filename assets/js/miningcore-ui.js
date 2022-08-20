// config
var API = 'https://ergo.miningcrypto.live/api/'; // API address
var defaultPool = 'ergo'; // Default Pool ID

var currentPool = defaultPool;

// private function
function _formatter(value, decimal, unit) {
    if (value === 0) {
        return '0 ' + unit;
    } else {
        var si = [
            { value: 1, symbol: "" },
            { value: 1e3, symbol: "k" },
            { value: 1e6, symbol: "M" },
            { value: 1e9, symbol: "G" },
            { value: 1e12, symbol: "T" },
            { value: 1e15, symbol: "P" },
            { value: 1e18, symbol: "E" },
            { value: 1e21, symbol: "Z" },
            { value: 1e24, symbol: "Y" },
        ];
        for (var i = si.length - 1; i > 0; i--) {
            if (value >= si[i].value) {
                break;
            }
        }
        return (value / si[i].value).toFixed(decimal).replace(/\.0+$|(\.[0-9]*[1-9])0+$/, "$1") + ' ' + si[i].symbol + unit;
    }
}

// Time convert Local -> UTC
function convertLocalDateToUTCDate(date, toUTC) {
	date = new Date(date);
	var localOffset = date.getTimezoneOffset() * 60000;
	var localTime = date.getTime();
	if (toUTC) {
	date = localTime + localOffset;
	} else {
	date = localTime - localOffset;
	}
	newDate = new Date(date);
	return newDate;
}


// Time convert UTC -> Local
function convertUTCDateToLocalDate(date) {
	var newDate = new Date(date.getTime()+date.getTimezoneOffset()*60*1000);
	var localOffset = date.getTimezoneOffset() / 60;
	var hours = date.getUTCHours();
	newDate.setHours(hours - localOffset);
	return newDate;
}


// String convert -> Date
function dateConvertor(date){
   var options = {  
     year: "numeric",  
     month: "numeric",  
     day: "numeric"
   };  

   var newDateFormat = new Date(date).toLocaleDateString("en-US", options); 
   var newTimeFormat = new Date(date).toLocaleTimeString();  
   var dateAndTime = newDateFormat +' '+ newTimeFormat        
   return dateAndTime
}



function loadPools(renderCallback) {
    $('#currentPool b').remove();
    $('#currentPool ul').remove();
    return $.ajax(API + 'pools')
        .done(function (data) {
            var poolList = '<ul class="dropdown-menu">';
            if (data.pools.length > 1) {
                $('#currentPool').attr('data-toggle', 'dropdown');
                $('#currentPool').append('<b class="caret"></b>');
            }
            $.each(data.pools, function (index, value) {
                if (currentPool.length === 0 && index === 0) {
                    currentPool = value.id;
                }
                if (currentPool === value.id) {
                    $('#currentPool p').attr('data-id', value.id);
                    $('#currentPool p').text(value.coin.type);
                } else {
                    poolList += '<li><a href="javascript:void(0)" data-id="' + value.id + '">' + value.coin.type + '</a></li>';
                }
            });
            poolList += '</ul>';
            if (poolList.length > 0) {
                $('#poolList').append(poolList);
            }
            if (data.pools.length > 1) {
                $('#poolList li a').on('click', function (event) {
                    currentPool = $(event.target).attr('data-id');
                    loadPools(renderCallback);
                });
            }
            if (renderCallback.has()) {
                renderCallback.fire();
            }
        })
        .fail(function () {
            $.notify({
                icon: "ti-cloud-down",
                message: "Error: No response from API.<br>(loadPools)",
            }, {
                type: 'danger',
                timer: 3000,
            });
        });
}

function loadStatsData() {
    return $.ajax(API + "pools")
	.done(function(data) {
	$.each(data.pools, function(index, value) {
		if (currentPool === value.id) {
		var PoolisOfPercent = ((value.poolStats.poolHashrate / value.networkStats.networkHashrate) * 100);
           	                $("#networkType").text(_formatter(value.poolStats.networkType, 0, ""));
		$("#coinName").text(value.coin.name);
		$("#coinAlgo").text(value.coin.algorithm);
		$("#blockchainHeight").text(value.networkStats.blockHeight);
		$("#connectedPeers").text(value.networkStats.connectedPeers);
		$("#minimumPayment").text(value.paymentProcessing.minimumPayment + " " + value.coin.type);
		$("#payoutScheme").text(value.paymentProcessing.payoutScheme);
		$("#rewardType").text(value.networkStats.rewardType);
		$("#poolFeePercent").text(value.poolFeePercent + " %");
		$("#poolHashRate").text(_formatter(value.poolStats.poolHashrate, 5, "H/s"));
		$("#poolMiners").text(value.poolStats.connectedMiners + " Miner(s)");
		$("#poolWorkers").text(value.poolStats.connectedWorkers + " Worker(s)");
		$("#networkHashRate").text(_formatter(value.networkStats.networkHashrate, 3, "H/s"));
		$("#networkDifficulty").text(_formatter(value.networkStats.networkDifficulty, 3, "H/s"));
		$("#lastNetworkBlock").text(dateConvertor(value.networkStats.lastNetworkBlockTime));
		$("#blockConfirmations").text(value.paymentProcessing.minimumConfirmations);
		$("#poolPercentofNetwork").text(PoolisOfPercent.toFixed(3) + " %");
		$("#poolEstimatedBlocks").text((PoolisOfPercent * 720 / 100).toFixed(4));
		$("#totalPaid").text(_formatter(value.totalPaid, 2, ""));
		$("#sharesPerSecond").text(_formatter(value.poolStats.sharesPerSecond, 5, 'H/s'));
		$("#poolBlocks").text(value.totalBlocks);
		
		}
	});
	})
        .fail(function () {
            $.notify({
                icon: "ti-cloud-down",
                message: "Error: No response from API.<br>(loadStatsData)",
            }, {
                type: 'danger',
                timer: 3000,
            });
        });
}

function loadStatsChart() {
    return $.ajax(API + 'pools/' + currentPool + '/performance')
        .done(function (data) {
            labels = [];
		baseLine = [];
            connectedMiners = [];
            networkHashRate = [];
            poolHashRate = [];
            $.each(data.stats, function (index, value) {
                if (labels.length === 0 || (labels.length + 1) % 4 === 1) {
                    labels.push(new Date(value.created).toISOString().slice(11, 16));
                } else {
                    labels.push('');
                }
                networkHashRate.push(value.networkHashrate);
                poolHashRate.push(value.poolHashrate);
                connectedMiners.push(value.connectedMiners);
            });
            var data = {
                labels: labels,
                series: [
                    poolHashRate,
                ],
            };
            var data2 = {
                labels: labels,
                series: [
                    baseLine,
                    networkHashRate,
                ],
            };
            var options = {
                showArea: true,
                height: "245px",
                axisX: {
                    showGrid: true,
                },
                axisY: {
                    offset: 47,
                    labelInterpolationFnc: function(value) {
                        return _formatter(value, 1, '');
                    }
                },
                lineSmooth: Chartist.Interpolation.simple({
                    divisor: 2,
                }),
            };
            var responsiveOptions = [
                ['screen and (max-width: 640px)', {
                    axisX: {
                        labelInterpolationFnc: function (value) {
                            return value[0];
                        }
                    },
                }],
            ];
            Chartist.Line('#chartStatsHashRate', data, options, responsiveOptions);
	
            var data = {
                labels: labels,
                series: [
                    connectedMiners,
                ],
            };
            var options = {
                height: "245px",
                axisX: {
                    showGrid: false,
                },
                lineSmooth: Chartist.Interpolation.simple({
                    divisor: 2,
                }),
            };
            var responsiveOptions = [
                ['screen and (max-width: 640px)', {
                    axisX: {
                        labelInterpolationFnc: function (value) {
                            return value[0];
                        }
                    },
                }],
            ];
            Chartist.Line('#chartStatsMiners', data, options, responsiveOptions);
        })
        .fail(function () {
            $.notify({
                icon: "ti-cloud-down",
                message: "Error: No response from API.<br>(loadStatsChart)",
            }, {
                type: 'danger',
                timer: 3000,
            });
        });
}



function loadDashboardData(walletAddress) {
    return $.ajax(API + 'pools/' + currentPool + '/miners/' + walletAddress)
        .done(function (data) {
            $('#pendingShares').text(_formatter(data.pendingShares, 0, ''));
            var workerHashRate = 0;
            $.each(data.performance.workers, function (index, value) {
                workerHashRate += value.hashrate;
            });
            $('#minerHashRate').text(_formatter(workerHashRate, 5, 'H/s'));
            $('#pendingBalance').text(_formatter(data.pendingBalance, 5, ''));
            $('#paidBalance').text(_formatter(data.totalPaid, 5, ''));
            $('#lifetimeBalance').text(_formatter(data.pendingBalance + data.totalPaid, 5, ''));
        })
        .fail(function () {
            $.notify({
                icon: "ti-cloud-down",
                message: "Error: No response from API.<br>(loadDashboardData)",
            }, {
                type: 'danger',
                timer: 3000,
            });
        });
}

function loadDashboardWorkerList(walletAddress) {
    return $.ajax(API + 'pools/' + currentPool + '/miners/' + walletAddress + '/performance')
        .done(function (data) {
            var workerList = '<thead><th>Name</th><th>Hash Rate</th><th>Share Rate</th></thead><tbody>';
            if (data.length > 0) {
                $.each(data[0].workers, function (index, value) {
                    workerList += '<tr>';
                    if (index.length === 0) {
                        workerList += '<td>Unnamed</td>';
                    } else {
                        workerList += '<td>' + index + '</td>';
                    }
                    workerList += '<td>' + _formatter(value.hashrate, 5, 'H/s') + '</td>';
                    workerList += '<td>' + _formatter(value.sharesPerSecond, 5, 'S/s') + '</td>';
                    workerList += '</tr>';
                });
            } else {
                workerList += '<tr><td colspan="3">None</td></tr>';
            }
            workerList += '</tbody>';
            $('#workerList').html(workerList);
        })
        .fail(function () {
            $.notify({
                icon: "ti-cloud-down",
                message: "Error: No response from API.<br>(loadDashboardWorkerList)",
            }, {
                type: 'danger',
                timer: 3000,
            });
        });
}

function loadDashboardChart(walletAddress) {
    return $.ajax(API + 'pools/' + currentPool + '/miners/' + walletAddress + '/performance')
        .done(function (data) {
            if (data.length > 0) {
                labels = [];
                minerHashRate = [];
                $.each(data, function (index, value) {
                    if (labels.length === 0 || (labels.length + 1) % 4 === 1) {
                        labels.push(new Date(value.created).toISOString().slice(11, 16));
                    } else {
                        labels.push('');
                    }
                    var workerHashRate = 0;
                    $.each(value.workers, function (index2, value2) {
                        workerHashRate += value2.hashrate;
                    });
                    minerHashRate.push(workerHashRate);
                });
                var data = {
                    labels: labels,
                    series: [
                        minerHashRate,
                    ],
                };
                var options = {
                    showArea: true,
                    height: "245px",
                    axisX: {
                        showGrid: false,
                    },
                    axisY: {
                        offset: 47,
                        labelInterpolationFnc: function(value) {
                            return _formatter(value, 1, '');
                        }
                    },
                    lineSmooth: Chartist.Interpolation.simple({
                        divisor: 2,
                    }),
                };
                var responsiveOptions = [
                    ['screen and (max-width: 640px)', {
                        axisX: {
                            labelInterpolationFnc: function (value) {
                                return value[0];
                            }
                        },
                    }],
                ];
                Chartist.Line('#chartDashboardHashRate', data, options, responsiveOptions);
            }
        })
        .fail(function () {
            $.notify({
                icon: "ti-cloud-down",
                message: "Error: No response from API.<br>(loadDashboardChart)",
            }, {
                type: 'danger',
                timer: 3000,
            });
        });
}

function loadMinersList() {
    return $.ajax(API + 'pools/' + currentPool + '/miners')
        .done(function (data) {
            var minerList = '<thead><tr><th>Address</th><th>Hash Rate</th><th>Share Rate</th></tr></thead><tbody>';
            if (data.length > 0) {
                $.each(data, function (index, value) {
                    minerList += '<tr>';
                    minerList += '<td>' + value.miner.substring(0, 12) + ' &hellip; ' + value.miner.substring(value.miner.length - 12) + '</td>';
                    //minerList += '<td><a href="' + value.minerAddressInfoLink + '" target="_blank">' + value.miner.substring(0, 12) + ' &hellip; ' + value.miner.substring(value.miner.length - 12) + '</td>';
                    minerList += '<td>' + _formatter(value.hashrate, 5, 'H/s') + '</td>';
                    minerList += '<td>' + _formatter(value.sharesPerSecond, 5, 'S/s') + '</td>';
                    minerList += '</tr>';
                });
            } else {
                minerList += '<tr><td colspan="3">None</td></tr>';
            }
            minerList += '</tbody>';
            $('#minerList').html(minerList);
        })
        .fail(function () {
            $.notify({
                icon: "ti-cloud-down",
                message: "Error: No response from API.<br>(loadMinersList)",
            }, {
                type: 'danger',
                timer: 3000,
            });
        });
}

function loadBlocksList() {
    return $.ajax(API + 'pools/' + currentPool + '/blocks?pageSize=10')
        .done(function (data) {
            var blockList = '<thead><tr><th rowspan="2">Date &amp; Time</th><th>Block Finder</th><th>Height</th><th>Difficulty</th><th>Effort</th><th>Status</th><th>Reward</th><th>Confirmation</th></tr></thead><tbody>';
            if (data.length > 0) {
                $.each(data, function(index, value) {
		var createDate = convertLocalDateToUTCDate(new Date(value.created),false);
		var effort = Math.round(value.effort * 100);
		var effortClass = "";
		if (effort < 100) {
		effortClass = "effort1";
		} else if (effort < 200) {
		effortClass = "effort2";
		} else if (effort < 500) {
		effortClass = "effort3";
		} else {
		effortClass = "effort4";
		}
	var calcs = Math.round(value.confirmationProgress * 100);
		blockList += "<tr>";
		blockList += "<td>" + createDate + "</td>";
		blockList += "<td>" + value.miner.substring(0, 8) + " &hellip; " + value.miner.substring(value.miner.length - 8) + "</td>";
		blockList += "<td><a href='" + value.infoLink + "' target='_blank'>" + value.blockHeight + "</a></td>";
		blockList += "<td>" + _formatter(value.networkDifficulty, 5, "H/s") + "</td>";
		if (typeof value.effort !== "undefined") {
		blockList += "<td><span class='" + effortClass + "'>" + effort + "%</span></td>";
		} else {
		blockList += "<td>n/a</td>";
		}
	var status = value.status;
                if (value.status == "confirmed") {
                blockList += "<td><span class='badge badge-success'>Confirmed</span></td>";
                } else if (value.status == "pending") {
                blockList += "<td><span class='badge badge-warning'>Pending</span></td>";
                } else if (value.status == "orphaned") {
                blockList += "<td><span class='badge badge-danger'>Orphaned</span></td>";
                } else {
                blockList += "<td>" + status + "</td>";
                }
		blockList += "<td>" + _formatter(value.reward, 5, "") + "</td>";
		blockList += "<td><div class='progress-bar bg-info progress-bar-striped progress-bar-animated' role='progressbar' aria-valuenow='" + calcs + "' aria-valuemin='0' aria-valuemax='100' style='width: " + calcs + "%'><span>" + calcs + "% Completed</span></div></td>";
		blockList += "</tr>";
	});
            } else {
                blockList += '<tr><td colspan="5">None</td></tr>';
            }
            blockList += '</tbody>';
            $('#blockList').html(blockList);
        })
        .fail(function () {
            $.notify({
                icon: "ti-cloud-down",
                message: "Error: No response from API.<br>(loadBlocksList)",
            }, {
                type: 'danger',
                timer: 3000,
            });
        });
}

function loadPaymentsList() {
    return $.ajax(API + 'pools/' + currentPool + '/payments?pageSize=500')
        .done(function (data) {
            var paymentList = '<thead><tr><th rowspan="2">Date &amp; Time</th><th>Address</th><th>Amount</th></tr><tr><th style="display: none"></th><th colspan="2">Confirmation</th></tr></thead><tbody>';
            if (data.length > 0) {
                $.each(data, function (index, value) {
                    paymentList += '<tr>';
                    paymentList += '<td rowspan="2">' + new Date(value.created).toLocaleString() + '</td>';
                    paymentList += '<td><a href="' + value.addressInfoLink + '" target="_blank">' + value.address.substring(0, 12) + ' &hellip; ' + value.address.substring(value.address.length - 12) + '</td>';
                    paymentList += '<td>' + _formatter(value.amount, 5, '') + '</td>';
                    paymentList += '</tr><tr><td style="display: none"></td>';
                    paymentList += '<td colspan="2"><a href="' + value.transactionInfoLink + '" target="_blank">' + value.transactionConfirmationData.substring(0, 16) + ' &hellip; ' + value.transactionConfirmationData.substring(value.transactionConfirmationData.length - 16) + ' </a></td>';
                    paymentList += '</tr>';
                });
            } else {
                paymentList += '<tr><td colspan="3">None</td></tr>';
            }
            paymentList += '</tbody>';
            $('#paymentList').html(paymentList);
        })
        .fail(function () {
            $.notify({
                icon: "ti-cloud-down",
                message: "Error: No response from API.<br>(loadPaymentsList)",
            }, {
                type: 'danger',
                timer: 3000,
            });
        });
}

function loadConnectConfig() {
    return $.ajax(API + 'pools')
        .done(function (data) {
            var connectPoolConfig = '<thead><tr><th>Item</th><th>Value</th></tr></thead><tbody>';
            $.each(data.pools, function (index, value) {
                if (currentPool === value.id) {
                    connectPoolConfig += '<tr><td>Algorithm</td><td>' + value.coin.algorithm +  '</td></tr>';
                    connectPoolConfig += '<tr><td>Wallet Address</td><td><a href="' + value.addressInfoLink + '" target="_blank">' + value.address.substring(0, 8) + ' &hellip; ' + value.address.substring(value.address.length - 8) + '</a></td></tr>';
                    connectPoolConfig += '<tr><td>Payout Scheme</td><td>' + value.paymentProcessing.payoutScheme + '</td></tr>';
                    connectPoolConfig += '<tr><td>Minimum Payment </td><td>' + value.paymentProcessing.minimumPayment + '</td></tr>';
                    if (typeof(value.paymentProcessing.minimumPaymentToPaymentId) !== "undefined") {
                        connectPoolConfig += '<tr><td>Minimum Payment w/ #</td><td>' + value.paymentProcessing.minimumPaymentToPaymentId + '</td></tr>';
                    }
                    connectPoolConfig += '<tr><td>Pool Fee</td><td>' + value.poolFeePercent + '%</td></tr>';
                    $.each(value.ports, function (port, options) {
                        connectPoolConfig += '<tr><td>Port ' + port + ' Difficulty</td><td>';
                        if (typeof(options.varDiff) !== "undefined") {
                            connectPoolConfig += 'Variable / ' + options.varDiff.minDiff + ' &harr; ';
                            if (typeof(options.varDiff.maxDiff) === "undefined") {
                                connectPoolConfig += '&infin;';
                            } else {
                                connectPoolConfig += options.varDiff.maxDiff;
                            }
                        } else {
                            connectPoolConfig += 'Static / ' + options.difficulty;
                        }
                        connectPoolConfig += '</td></tr>';
                    });
                }
            });
            connectPoolConfig += '</tbody>';
            $('#connectPoolConfig').html(connectPoolConfig);
        })
        .fail(function () {
            $.notify({
                icon: "ti-cloud-down",
                message: "Error: No response from API.<br>(loadConnectConfig)",
            }, {
                type: 'danger',
                timer: 3000,
            });
        });
}
