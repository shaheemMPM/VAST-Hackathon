"use strict";

function _defineProperty(e, t, n) {
    return t in e ? Object.defineProperty(e, t, {
        value: n,
        enumerable: !0,
        configurable: !0,
        writable: !0
    }) : e[t] = n, e
}
var backgroundJS = chrome.extension.getBackgroundPage(),
    htmlTemplates = document.querySelector('link[rel="import"][href="html/templates.html"]')["import"],
    ranks = {},
    data, html, getDomainsData = function(e, t) {
        var n, a, r, s, o, i, d, l, c, u = 0;
        if (o = getDateDiffDays(backgroundJS.dates.today, backgroundJS.dates.start) + 1, n = {
                range: e,
                resolution: t,
                dateStart: backgroundJS.dates.start,
                daysSinceStart: o,
                domains: [],
                total: {
                    name: "Total",
                    time: 0,
                    percentage: 100,
                    percentageText: "100.00 %"
                }
            }, a = backgroundJS.domains, e === RANGE_TODAY) {
            r = backgroundJS.dates.today, s = backgroundJS.seconds.today;
            for (i in a) a.hasOwnProperty(i) && a[i].days.hasOwnProperty(r) && (d = a[i].days[r].seconds / s * 100, l = getPercentageString(d), c = d > GRAPH_MIN_PERCENTAGE_TO_INCLUDE, u += c ? 1 : 0, n.domains.push({
                name: a[i].name,
                time: a[i].days[r].seconds,
                percentage: d,
                percentageString: l,
                graphed: c
            }))
        }
        if (e === RANGE_AVERAGE) {
            s = backgroundJS.seconds.alltime / o;
            for (i in a) a.hasOwnProperty(i) && (d = a[i].alltime.seconds / s * 100 / o, l = getPercentageString(d), c = d > GRAPH_MIN_PERCENTAGE_TO_INCLUDE, u += c ? 1 : 0, n.domains.push({
                name: a[i].name,
                time: parseInt(a[i].alltime.seconds / o),
                percentage: d,
                percentageString: l,
                graphed: c
            }))
        }
        if (e === RANGE_ALLTIME) {
            s = backgroundJS.seconds.alltime;
            for (i in a) a.hasOwnProperty(i) && (d = a[i].alltime.seconds / s * 100, l = getPercentageString(d), c = d > GRAPH_MIN_PERCENTAGE_TO_INCLUDE, u += c ? 1 : 0, n.domains.push({
                name: a[i].name,
                time: a[i].alltime.seconds,
                percentage: d,
                percentageString: l,
                graphed: c
            }))
        }
        for (n.total.time = s, n.domains.sort(function(e, t) {
                return t.percentage - e.percentage
            }), i = 0; i < n.domains.length; i++) n.domains[i].graphed && (n.domains[i].color = getHSL(i, u));
        return n
    },
    updateDoughnutInfotext = function(e, t, n) {
        var a = document.querySelector("#doughnut-" + e + " .foreign-object .name");
        a.innerHTML = t;
        var r = document.querySelector("#doughnut-" + e + " .foreign-object .percentage");
        r.innerHTML = n
    },
    renderUIRange = function(e, t, n, a, r) {
        var s = getDomainsData(e, t);
        n && renderUIRangeDoughnut(s, e), a && renderUIRangeTable(s, e), r && countRanks(s.domains, e)
    },
    renderUIRangeTable = function(e, t) {
        var n = tplHtmlTable(e);
        htmlRenderInto("table-" + t, n)
    },
    renderUIRangeDoughnut = function(e, t) {
        var n = tplElementDoughnut(e, backgroundJS.settings.graphGap);
        elementInsertInto("doughnut-" + t, n)
    },
    countRanks = function(e, t) {
        var n;
        for (ranks[t] = {
                total: e.length,
                domains: {}
            }, n = 0; n < e.length; n++) ranks[t].domains[e[n].name] = n + 1;
        return !0
    },
    renderControlIdleTime = function() {
        var e = {
            min: 0,
            max: [IDLE_TIME_TABLE.length - 1],
            raw: getSliderRawFromComputed(IDLE_TIME_TABLE, IDLE_TIME_DEFAULT, backgroundJS.settings.idleTime),
            computed: getIdleTimeComputedString(backgroundJS.settings.idleTime),
            "default": getIdleTimeComputedString(IDLE_TIME_DEFAULT)
        };
        html = tplHtmlIdleTimeControl(e), htmlRenderInto("idle-time", html)
    },
    renderControlGraphGap = function() {
        var e = {
            min: 0,
            max: [GRAPH_GAP_TABLE.length - 1],
            raw: getSliderRawFromComputed(GRAPH_GAP_TABLE, GRAPH_GAP_DEFAULT, backgroundJS.settings.graphGap)
        };
        html = tplHtmlGraphGapControl(e), htmlRenderInto("graph-gap", html)
    },
    renderControlBadgeDisplay = function() {
        var e = {
            checked: backgroundJS.settings.badgeDisplay
        };
        html = tplHtmlBadgeDisplayControl(e), htmlRenderInto("badge-display", html)
    },
    clearOverallStats = function() {
        return document.querySelector("#pseudomodal .container.stats .stats-wrapper .text").innerHTML = "", document.querySelector("#pseudomodal .container.stats .stats-wrapper .charts").innerHTML = "", document.querySelector("#pseudomodal .container.stats .stats-wrapper").dataset.statsReady = "0", !0
    },
    renderUI = function() {
        renderUIRange(RANGE_TODAY, RESOLUTION_HOURS, !0, !0, !0), renderUIRange(RANGE_AVERAGE, RESOLUTION_HOURS, !0, !0, !1), renderUIRange(RANGE_ALLTIME, RESOLUTION_DAYS, !0, !0, !0), renderControlIdleTime(), renderControlGraphGap(), renderControlBadgeDisplay(), clearOverallStats(), dcl("UI rendered")
    },
    screenshotUIShow = function() {
        return document.querySelector("html").classList.add("screenshot-mode"), document.querySelector("footer").style.display = "none", screenshotUICaptureShow(), chrome.permissions.contains({
            origins: ["<all_urls>"]
        }, function(e) {
            if (chrome.runtime.lastError && chrome.runtime.lastError.message && dcl("Screenshot - permission.contains: " + chrome.runtime.lastError.message), e) {
                if (!backgroundJS.settings.screenshotInstructionsRead) {
                    var t = htmlTemplates.querySelector("#screenshot-info-instructions-list"),
                        n = document.importNode(t.content, !0);
                    elementInsertIntoElement(document.querySelector(".screenshot-info .instructions .list"), n), document.querySelector(".screenshot-overlay").style.display = "block", document.querySelector(".screenshot-info").style.display = "block", document.querySelector(".screenshot-info .instructions").style.display = "block", document.querySelector(".screenshot-info .permission-grant").style.display = "none", backgroundJS.setScreenshotInstructionsRead(!0), backgroundJS.saveScreenshotInstructionsRead()
                }
            } else document.querySelector(".screenshot-overlay").style.display = "block", document.querySelector(".screenshot-info").style.display = "block", document.querySelector(".screenshot-info .instructions").style.display = "none", document.querySelector(".screenshot-info .permission-grant").style.display = "block"
        }), !0
    },
    screenshotUIHide = function() {
        return document.querySelector(".screenshot-overlay").style.display = "none", document.querySelector(".screenshot-info").style.display = "none", !0
    },
    screenshotUICaptureShow = function() {
        return document.querySelector(".screenshot-capture").style.display = "block", !0
    },
    screenshotUICaptureHide = function() {
        return document.querySelector(".screenshot-capture").style.display = "none", !0
    },
    renderScreenshotUI = function() {
        return window.location.search === SCREENSHOT_MODE_QUERY && (SCREENSHOT_MODE = !0, screenshotUIShow()), !0
    },
    initialize = function() {
        return renderUI(), renderScreenshotUI(), dcl("Application initialized"), !0
    };
initialize(), addMultipleDelegatedEventListeners("body", "click", function(e, t) {
    if (e.detail >= 2)
        if (document.selection && document.selection.empty) document.selection.empty();
        else if (window.getSelection) {
        var n = window.getSelection();
        n.removeAllRanges()
    }
    return !0
}), addMultipleDelegatedEventListeners(".doughnut .group", "click,mouseover,mouseout", function(e, t) {
    var n, a, r = "",
        s = "",
        o = t.parentNode.getAttribute("wt:range"),
        i = t.getAttribute("wt:connect-id"),
        d = t.getAttribute("wt:url"),
        l = t.getAttribute("wt:no-data"),
        c = !1;
    if ("click" === e.type) "other" !== d && window.open("http://" + d);
    else {
        var u = document.querySelectorAll("#table-" + o + ' tr.domain[data-connect-id="' + i + '"]');
        if ("mouseover" === e.type) {
            var m = document.querySelectorAll("#doughnut-" + o + " .group");
            for (n = 0; n < m.length; n++) m[n].classList.remove("active");
            t.classList.add("active"), r = t.getAttribute("wt:name"), s = t.getAttribute("wt:percentage-string");
            var g = document.querySelectorAll("#table-" + o + " tr.domain");
            if (g)
                for (a = 0; a < g.length; a++) g[a].classList.remove("active");
            if (u)
                for (a = 0; a < u.length; a++) u[a].classList.add("active")
        } else if (SCREENSHOT_MODE) c = !0;
        else if (t.classList.remove("active"), u.length > 0)
            for (a = 0; a < u.length; a++) u[a].classList.remove("active");
        "false" === l && c === !1 && updateDoughnutInfotext(o, r, s)
    }
    return !0
}), addMultipleDelegatedEventListeners(".datatable tbody tr", "click,mouseover,mouseout", function(e, t) {
    var n, a = "",
        r = "",
        s = t.parentNode.parentNode.dataset.range,
        o = t.dataset.connectId,
        i = t.dataset.url;
    if ("click" === e.type && t.classList.contains("domain")) renderDomainStats({
        contextEl: t,
        range: s,
        connectId: o,
        url: i
    });
    else {
        var d = document.querySelector("#doughnut-" + s + ' .group[wt\\:connect-id="' + o + '"]');
        if (d) {
            if ("mouseover" === e.type) {
                var l = document.querySelectorAll("#table-" + s + " tr.domain");
                if (l)
                    for (n = 0; n < l.length; n++) l[n].classList.remove("active");
                d.classList.add("active"), a = d.getAttribute("wt:name"), r = d.getAttribute("wt:percentage-string")
            }
            if ("mouseout" === e.type && d.classList.remove("active"), t.classList.contains("stats")) {
                var c = document.querySelector("#table-" + s + ' tr.domain[data-url="' + i + '"]');
                "mouseover" === e.type ? c.classList.add("active") : c.classList.remove("active")
            }
            updateDoughnutInfotext(s, a, r)
        }
    }
    return !0
}), addMultipleDelegatedEventListeners(".chart-days .chart .days g.group", "mouseover,mouseout", function(e, t) {
    var n = t.closest(".chart-days").querySelector(".info .date"),
        a = t.closest(".chart-days").querySelector(".info .time"),
        r = t.getAttribute("wt:date"),
        s = t.getAttribute("wt:time");
    return "mouseover" === e.type ? (n.innerHTML = r, a.innerHTML = tplHtmlTimeObjectFragment({
        value: s,
        resolution: RESOLUTION_HOURS
    })) : "mouseout" === e.type && (n.innerHTML = "&nbsp;", a.innerHTML = "&nbsp;"), !0
}), addMultipleDelegatedEventListeners(".chart-daynames .chart .daynames g.group", "mouseover,mouseout", function(e, t) {
    var n = t.closest(".chart-daynames").querySelector(".info .percentage"),
        a = t.closest(".chart-daynames").querySelector(".info .time"),
        r = t.getAttribute("wt:percentage-string"),
        s = t.getAttribute("wt:time");
    return "mouseover" === e.type ? (a.innerHTML = tplHtmlTimeObjectFragment({
        value: s,
        resolution: RESOLUTION_DAYS
    }), n.innerHTML = r) : "mouseout" === e.type && (a.innerHTML = "&nbsp;", n.innerHTML = "&nbsp;"), !0
}), addMultipleDelegatedEventListeners(".chart-types a", "click", function(e, t) {
    e.preventDefault();
    var n = t.dataset.visibility;
    return document.getElementById("wrapper").dataset.visibility = n, !0
}), addMultipleDelegatedEventListeners("#pseudomodal .menu a", "click", function(e, t) {
    e.preventDefault();
    var n = t.getAttribute("id");
    if ("screenshot" !== n) document.querySelector("#pseudomodal").dataset.visibility = n;
    else if (SCREENSHOT_MODE) {
        document.querySelector("#pseudomodal").dataset.visibility = n;
        var a = htmlTemplates.querySelector("#screenshot-info-instructions-list"),
            r = document.importNode(a.content, !0);
        elementInsertIntoElement(document.querySelector("#pseudomodal .container.screenshot .list"), r)
    }
    if ("stats" === n) {
        var s = document.querySelector("#pseudomodal .container.stats .stats-wrapper");
        if ("1" !== s.dataset.statsReady) {
            dcl("Stats overall - render");
            var o = getAvailableElementWidth(s),
                i = getOverallData(),
                d = htmlTemplates.querySelector("#stats-overall");
            tplElementStatsOverall(i, d.content);
            var l = document.importNode(d.content, !0);
            if (elementInsertIntoElement(s.querySelector(".text"), l), i.days.visited > 0) {
                var a = htmlTemplates.querySelector("#stats-charts");
                tplElementStatsCharts(i, a.content);
                var r = document.importNode(a.content, !0);
                elementInsertIntoElement(s.querySelector(".charts"), r);
                var c = tplElementChartStatsDays({
                    chartWidth: o,
                    chartHeight: CHART_STATS_HEIGHT_DAYS,
                    stepHeightMin: CHART_STATS_STEP_HEIGHT_MIN,
                    timeValueMax: i.timeValues.max,
                    daysTotal: i.days.total,
                    days: i.dates.days
                });
                elementInsertIntoElement(s.querySelector(".chart-days .chart"), c);
                var u = tplElementChartStatsDaynames({
                    chartWidth: o,
                    chartHeight: CHART_STATS_HEIGHT_DAYNAMES,
                    stepHeightMin: CHART_STATS_STEP_HEIGHT_MIN,
                    daynames: i.dates.daynames
                });
                elementInsertIntoElement(s.querySelector(".chart-daynames .chart"), u)
            }
            s.dataset.statsReady = "1"
        }
    }
    return !0
}), addMultipleDelegatedEventListeners("#pseudomodal #idle-time .slider", "input,change", function(e, t) {
    var n = t.value,
        a = getIdleTimeComputedFromRaw(n),
        r = getIdleTimeComputedString(a);
    return document.querySelector("#pseudomodal #idle-time .display").innerHTML = r, "change" === e.type && (backgroundJS.setIdleTime(a), backgroundJS.saveIdleTime(), dcl("Idle time saved: " + a)), !0
}), addMultipleDelegatedEventListeners("#pseudomodal #graph-gap .slider", "input,change", function(e, t) {
    var n = t.value,
        a = getSliderComputedFromRaw(GRAPH_GAP_TABLE, GRAPH_GAP_DEFAULT, n);
    return document.querySelector("#pseudomodal #graph-gap .display").innerHTML = n, "change" === e.type && (backgroundJS.setGraphGap(a), backgroundJS.saveGraphGap(), renderUIRange(RANGE_TODAY, RESOLUTION_HOURS, !0, !1, !1), renderUIRange(RANGE_AVERAGE, RESOLUTION_DAYS, !0, !1, !1), renderUIRange(RANGE_ALLTIME, RESOLUTION_DAYS, !0, !1, !1), dcl("Graph gap saved: " + a)), !0
}), addMultipleDelegatedEventListeners("#pseudomodal #badge-display .checkbox", "change", function(e, t) {
    var n = t.checked;
    return "change" === e.type && (backgroundJS.setBadgeDisplay(n), backgroundJS.saveBadgeDisplay(), backgroundJS.updateDomains(!0), dcl("Badge display saved: " + n)), !0
}), addMultipleDelegatedEventListeners("#pseudomodal .trigger", "click", function(e, t) {
    e.preventDefault();
    var n = t.parentNode.querySelector(".confirm");
    return n.classList.add("visible"), !0
}), addMultipleDelegatedEventListeners("#pseudomodal .confirm .cancel", "click", function(e, t) {
    e.preventDefault();
    var n = t.parentNode;
    return n.classList.remove("visible"), !0
}), addMultipleDelegatedEventListeners("#pseudomodal .options-clear-all", "click", function(e, t) {
    var n = t.querySelector(".text"),
        a = t.querySelector(".loading");
    return e.preventDefault(), t.classList.contains("active") ? (t.classList.remove("active"), n.innerText = n.dataset["default"], a.classList.remove("running"), backgroundJS.clearAllGeneratedData(), renderUI(), dcl("All data cleared")) : (t.classList.add("active"), n.innerText = n.dataset.active, a.classList.add("running", "warning"), a.querySelector(".shifter").style.animationDuration = INTERVAL_UI_LOADING + "ms", setTimeout(function() {
        t.classList.remove("active"), n.innerText = n.dataset["default"], a.classList.remove("running")
    }, INTERVAL_UI_LOADING)), !0
}), addMultipleDelegatedEventListeners("#pseudomodal .options-reset-settings", "click", function(e, t) {
    var n = t.querySelector(".text"),
        a = t.querySelector(".loading");
    return e.preventDefault(), t.classList.contains("active") ? (t.classList.remove("active"), n.innerText = n.dataset["default"], a.classList.remove("running"), backgroundJS.settings.idleTime = IDLE_TIME_DEFAULT, backgroundJS.saveIdleTime(), backgroundJS.settings.graphGap = GRAPH_GAP_DEFAULT, backgroundJS.saveGraphGap(), backgroundJS.settings.badgeDisplay = BADGE_DISPLAY_DEFAULT, backgroundJS.saveBadgeDisplay(), backgroundJS.updateDomains(!0), renderUI(), dcl("Settings reset")) : (t.classList.add("active"), n.innerText = n.dataset.active, a.classList.add("running", "warning"), a.querySelector(".shifter").style.animationDuration = INTERVAL_UI_LOADING + "ms", setTimeout(function() {
        t.classList.remove("active"), n.innerText = n.dataset["default"], a.classList.remove("running")
    }, INTERVAL_UI_LOADING)), !0
}), addMultipleDelegatedEventListeners("#pseudomodal .options-export-csv", "click", function(e, t) {
    e.preventDefault();
    var n = convertArrayToCsv(backgroundJS.domains, backgroundJS.dates.start, backgroundJS.dates.today);
    return initiateDownload([n], "octet/stream", "digital-wellbeing-" + backgroundJS.dates.today + ".xls"), !0
}), addMultipleDelegatedEventListeners("#pseudomodal .options-backup", "click", function(e, t) {
    var n, a, r = {
            domains: backgroundJS.domains,
            dates: {
                start: backgroundJS.dates.start
            },
            seconds: {
                alltime: backgroundJS.seconds.alltime
            },
            settings: backgroundJS.settings
        },
        s = JSON.stringify(r);
    return e.preventDefault(), sha256(s).then(function(e) {
        n = {
            content: r,
            hash: {
                sha256: e
            }
        }, a = JSON.stringify(n), initiateDownload([a], "octet/stream", "webtime-tracker-backup-" + backgroundJS.dates.today + ".json")
    }), !0
}), addMultipleDelegatedEventListeners("#pseudomodal .options-restore", "click", function(e, t) {
    var n = t.querySelector('input[type="file"]');
    return n.value = null, n.click(), !0
}), addMultipleDelegatedEventListeners("#screenshot", "click", function(e, t) {
    if (!SCREENSHOT_MODE) {
        var n = window.location.href + SCREENSHOT_MODE_QUERY,
            a = window.innerWidth;
        a -= window.innerHeight <= document.body.scrollHeight ? SCROLLBAR_WIDTH : 0;
        var r = window.innerHeight,
            s = Math.round(screen.availWidth / 2 - a / 2);
        dcl(screen.availWidth);
        var o = 40;
        window.open(n, "_blank", "width=" + a + ",height=" + r + ",left=" + s + ",top=" + o + ",resizable=yes,location=no,menubar=no,scrollbars=no,status=no,titlebar=no,toolbar=no")
    }
    return !0
}), addMultipleDelegatedEventListeners('#pseudomodal .options-restore input[type="file"]', "change", function(e, t) {
    var n, a = e.target.files,
        r = a[0],
        s = new FileReader;
    return s.onload = function(e) {
        return function(e) {
            n = e.target.result, restoreFromJson(n)
        }
    }(r), s.readAsText(r), !0
}), addMultipleDelegatedEventListeners(".screenshot-info .ok", "click", function(e, t) {
    return screenshotUIHide(), !0
}), addMultipleDelegatedEventListeners(".screenshot-info .permission-grant", "click", function(e, t) {
    return chrome.permissions.request({
        origins: ["<all_urls>"]
    }, function(e) {
        chrome.runtime.lastError && chrome.runtime.lastError.message && dcl("Screenshot - permission.request: " + chrome.runtime.lastError.message), screenshotUIShow()
    }), !0
}), addMultipleDelegatedEventListeners(".screenshot-capture .capture", "click", function(e, t) {
    return e.preventDefault(), console.log("Screenshot - start"), screenshotUICaptureHide(), setTimeout(function() {
        chrome.tabs.captureVisibleTab(null, {
            format: "png"
        }, function(e) {
            if (chrome.runtime.lastError && chrome.runtime.lastError.message) dcl("Screenshot - error: " + chrome.runtime.lastError.message);
            else {
                for (var t = e.split(",")[0].split(":")[1].split(";")[0], n = window.atob(e.split(",")[1]), a = new Uint8Array(n.length), r = 0; r < n.length; r++) a[r] = n.charCodeAt(r);
                var s = (new Date).toISOString().replace(/[T:]/g, "-").split(".")[0],
                    o = "webtime-tracker-screenshot-" + s + ".png";
                initiateDownload([a], t, o), screenshotUICaptureShow()
            }
        })
    }, SCREENSHOT_WAIT), !0
});
var restoreFromJson = function(e) {
        var t = document.querySelector("#pseudomodal .options-restore"),
            n = t.querySelector(".text"),
            a = t.querySelector(".loading"),
            r = function() {
                n.innerText = n.dataset.warning, a.classList.add("blinking", "warning"), a.querySelector(".shifter").style.animationDuration = UI_LOADING_BLINKING_INTERVAL + "ms", a.querySelector(".shifter").style.animationIterationCount = UI_LOADING_BLINKING_COUNT, setTimeout(function() {
                    n.innerText = n.dataset["default"], a.classList.remove("blinking")
                }, UI_LOADING_BLINKING_INTERVAL * UI_LOADING_BLINKING_COUNT)
            },
            s = function() {
                n.innerText = n.dataset.restored, a.classList.add("blinking", "success"), a.querySelector(".shifter").style.animationDuration = UI_LOADING_BLINKING_INTERVAL + "ms", a.querySelector(".shifter").style.animationIterationCount = UI_LOADING_BLINKING_COUNT, setTimeout(function() {
                    n.innerText = n.dataset["default"], a.classList.remove("blinking")
                }, UI_LOADING_BLINKING_INTERVAL * UI_LOADING_BLINKING_COUNT)
            };
        try {
            var o = JSON.parse(e),
                i = JSON.stringify(o.content)
        } catch (d) {
            return r(), !1
        }
        return sha256(i).then(function(e) {
            o.hash.sha256 === e || SKIP_RESTORE_HASH_CHECK ? (o.hash.sha256 !== e && dcl("Restore - hashes mismatch!"), backgroundJS.domains = o.content.domains, backgroundJS.dates.start = o.content.dates.start, backgroundJS.seconds.today = getTotalSecondsForDate(o.content.domains, getDateString()), backgroundJS.seconds.alltime = o.content.seconds.alltime, backgroundJS.settings = o.content.settings, backgroundJS.saveDomains(), backgroundJS.saveDateStart(), backgroundJS.saveSecondsAlltime(), backgroundJS.saveIdleTime(), backgroundJS.saveGraphGap(), renderUI(), s(), dcl("Restore - done!")) : (r(), dcl("Restore - data corrupted"))
        }), !0
    },
    renderDomainStats = function(e) {
        var t;
        if ("1" !== e.contextEl.dataset.statsReady) {
            dcl("Rendering stats for: " + e.url);
            var n = getDomainData(e.url);
            n = Object.assign(n, e), n.color = e.contextEl.querySelector(".label span").style.color;
            var a = htmlTemplates.querySelector("#stats-domain");
            tplElementStatsDomain(n, a.content);
            var r = document.importNode(a.content, !0);
            elementInsertAfterElement(e.contextEl, r), t = document.querySelector("#table-" + e.range + ' tr.stats[data-url="' + e.url + '"]');
            var s = htmlTemplates.querySelector("#stats-charts");
            tplElementStatsCharts(n, s.content);
            var o = document.importNode(s.content, !0);
            elementAppendToElement(t.querySelector(".content"), o);
            var i = getAvailableElementWidth(t.querySelector(".content")),
                d = tplElementChartStatsDays({
                    chartWidth: i,
                    chartHeight: CHART_STATS_HEIGHT_DAYS,
                    stepHeightMin: CHART_STATS_STEP_HEIGHT_MIN,
                    timeValueMax: n.timeValues.max,
                    daysTotal: n.days.total,
                    days: n.dates.days
                });
            elementInsertIntoElement(t.querySelector(".chart-days .chart"), d);
            var l = tplElementChartStatsDaynames({
                chartWidth: i,
                chartHeight: CHART_STATS_HEIGHT_DAYNAMES,
                stepHeightMin: CHART_STATS_STEP_HEIGHT_MIN,
                daynames: n.dates.daynames
            });
            elementInsertIntoElement(t.querySelector(".chart-daynames .chart"), l), e.contextEl.dataset.statsReady = "1"
        }
        return "1" === e.contextEl.dataset.statsVisible ? (document.querySelector("#table-" + e.range + ' tr.stats[data-url="' + e.url + '"]').style.display = "none", e.contextEl.dataset.statsVisible = "0") : (document.querySelector("#table-" + e.range + ' tr.stats[data-url="' + e.url + '"]').style.display = "table-row", e.contextEl.dataset.statsVisible = "1"), !0
    },
    getDomainData = function(e) {
        var t, n, a, r, s, o, i, d, l, c = Number.MAX_SAFE_INTEGER,
            u = Number.MIN_SAFE_INTEGER,
            m = backgroundJS.dates.start,
            g = backgroundJS.dates.start,
            p = backgroundJS.dates.today,
            S = backgroundJS.dates.start,
            y = [],
            h = 0,
            E = backgroundJS.domains[e],
            v = getDateDiffDays(backgroundJS.dates.today, backgroundJS.dates.start) + 1;
        for (d = getDatesSparse(backgroundJS.dates.start, v - 1), l = [0, 0, 0, 0, 0, 0, 0], a = 0; a < d.length; a++) o = d[a], i = 0, E.days.hasOwnProperty(d[a]) && (h++, i = E.days[o].seconds, m = c > i ? o : m, g = i > u ? o : g, c = c > i ? i : c, u = i > u ? i : u, p = p > o ? o : p, S = o > S ? o : S), s = (new Date(o).getDay() + 6) % 7, l[s] += i, y.push({
            date: o,
            seconds: i
        });
        return r = {
            days: {
                total: v,
                domain: h
            },
            timeValues: {
                min: c,
                max: u
            },
            visits: {
                first: p,
                last: S
            },
            ranks: (t = {}, _defineProperty(t, RANGE_TODAY, {
                position: ranks[RANGE_TODAY].domains[e] || "-",
                total: ranks[RANGE_TODAY].total
            }), _defineProperty(t, RANGE_ALLTIME, {
                position: ranks[RANGE_ALLTIME].domains[e],
                total: ranks[RANGE_ALLTIME].total
            }), t),
            times: (n = {}, _defineProperty(n, RANGE_TODAY, E.days[backgroundJS.dates.today] ? E.days[backgroundJS.dates.today].seconds || 0 : 0), _defineProperty(n, RANGE_AVERAGE, parseInt(E.alltime.seconds / v)), _defineProperty(n, RANGE_AVERAGE + "-pure", parseInt(E.alltime.seconds / h)), _defineProperty(n, RANGE_ALLTIME, E.alltime.seconds), n),
            dates: {
                start: backgroundJS.dates.start,
                today: backgroundJS.dates.today,
                timeMin: m,
                timeMax: g,
                days: y,
                daynames: l
            }
        }
    },
    getOverallData = function() {
        var e, t, n, a, r, s, o, i, d, l, c, u = Number.MAX_SAFE_INTEGER,
            m = Number.MIN_SAFE_INTEGER,
            g = backgroundJS.dates.start,
            p = backgroundJS.dates.start,
            S = backgroundJS.dates.today,
            y = backgroundJS.dates.start,
            h = [],
            E = 0,
            v = getDateDiffDays(backgroundJS.dates.today, backgroundJS.dates.start) + 1;
        l = getDatesSparse(backgroundJS.dates.start, v - 1), c = [0, 0, 0, 0, 0, 0, 0], s = {};
        for (i in backgroundJS.domains)
            if (backgroundJS.domains.hasOwnProperty(i)) {
                d = backgroundJS.domains[i].days;
                for (r in d) d.hasOwnProperty(r) && (s[r] = s[r] || {
                    seconds: 0
                }, s[r].seconds += d[r].seconds)
            } for (t = 0; t < l.length; t++) r = l[t], o = 0, s.hasOwnProperty(l[t]) && (o = s[r].seconds, g = u > o ? r : g, p = o > m ? r : p, u = u > o ? o : u, m = o > m ? o : m, S = S > r ? r : S, y = r > y ? r : y), a = (new Date(r).getDay() + 6) % 7, c[a] += o, o > 0 && E++, h.push({
            date: r,
            seconds: o
        });
        return n = {
            days: {
                total: v,
                visited: E
            },
            timeValues: {
                min: u === Number.MAX_SAFE_INTEGER ? 0 : u,
                max: m === Number.MIN_SAFE_INTEGER ? 0 : m
            },
            visits: {
                first: S,
                last: y
            },
            times: (e = {}, _defineProperty(e, RANGE_TODAY, backgroundJS.seconds.today), _defineProperty(e, RANGE_AVERAGE, parseInt(backgroundJS.seconds.alltime / v)), _defineProperty(e, RANGE_AVERAGE + "-pure", E > 0 ? parseInt(backgroundJS.seconds.alltime / E) : 0), _defineProperty(e, RANGE_ALLTIME, backgroundJS.seconds.alltime), e),
            dates: {
                start: backgroundJS.dates.start,
                today: backgroundJS.dates.today,
                timeMin: g,
                timeMax: p,
                days: h,
                daynames: c
            }
        }
    };
