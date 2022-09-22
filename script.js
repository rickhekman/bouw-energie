
/**
 * Element.closest() polyfill
 * https://developer.mozilla.org/en-US/docs/Web/API/Element/closest#Polyfill
 */
if (!Element.prototype.matches) {
    Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
}

if (!Element.prototype.closest) {
    Element.prototype.closest = function (s) {
        var el = this;

        do {
            if (Element.prototype.matches.call(el, s)) return el;
            el = el.parentElement || el.parentNode;
        } while (el !== null && el.nodeType === 1);
        return null;
    };
}

/**
 * Class.
 */
function MiibwnrgClass() {

    var root,
        form,
        filter1,
        filter2,
        filter3,
        start,
        overview,
        listTitle,
        listData,
        counter,
        homeBtn;

    /**
     * Scroll to.
     * @param {*} el
     * Use 100ms timeout to ensure correct scroll position.
     */
    function scrollTo(el) {
        var rect = el.getBoundingClientRect();
        setTimeout(function () {
            window.scrollTo({
                'behavior': 'smooth',
                'left': 0,
                'top': (rect.top + window.pageYOffset)
            });
        }, 100);
    }

    /**
     * View.
     * @param {*} v 
     */
    function view(v) {
        if ('start' === v) {
            start.classList.remove('miibwnrg__section_hidden');
            overview.classList.add('miibwnrg__section_hidden');
            homeBtn.classList.toggle('active',false);
        } else if ('list' === v) {
            var filterTitle = [];

            if (filter1.selectedIndex > 0) {
                filterTitle.push('Type: ' + filter1.options[filter1.selectedIndex].text);
            }
            if (filter2.selectedIndex > 0) {
                filterTitle.push('Doelgroep: ' + filter2.options[filter2.selectedIndex].text);
            }
            if (filter3.selectedIndex > 0) {
                filterTitle.push(filter3.options[filter3.selectedIndex].text);
            }
            if (filterTitle.length > 0) {
                listTitle.innerHTML = filterTitle.join(' & ') + ' (' + counter + ')';
            } else {
                listTitle.innerHTML = 'Alle maatregelen' + ' (' + counter + ')';
            }
            start.classList.add('miibwnrg__section_hidden');
            overview.classList.remove('miibwnrg__section_hidden');
            homeBtn.classList.toggle('active',true);
        }
    }

    function resetForm() {
        filter1.value = '';
        filter2.value = '';
        filter3.value = '';
        formSubmit();
    }

    function formSubmit() {
        var formData = new FormData(form);

        filterList(formData);
        view('list');
        scrollTo(root);

        return false;
    }

    function filterList(formData) {
        counter = 0;
        var items = listData.children;

        // Loop list items.
        for (var i = 0; i < items.length; i++) {
            var item = items[i],
                filter1Val = formData.get('filter1'),
                filter1Arr = item.dataset.filter1.split(','),
                filter2Val = formData.get('filter2'),
                filter2Arr = item.dataset.filter2.split(','),
                filter3Val = formData.get('filter3'),
                filter3Arr = item.dataset.filter3.split(',');

            // No filters selected.
            if ( !filter1Val && !filter2Val && !filter3Val ) {
                item.style.display = 'block';
                counter++;

            // Match filter 1.
            } else if ( ( filter1Val && !filter2Val ) && ( -1 < filter1Arr.indexOf(filter1Val) ) ) {
                item.style.display = 'block';
                counter++;
            // Match filter 2.
            } else if ( ( !filter1Val && filter2Val ) && ( -1 < filter2Arr.indexOf(filter2Val) ) ) {
                item.style.display = 'block';
                counter++;
            // Match both filters.
            } else if ( ( filter1Val && filter2Val ) && ( -1 < filter1Arr.indexOf(filter1Val) && -1 < filter2Arr.indexOf(filter2Val) ) ) {
                item.style.display = 'block';
                counter++;
            // Match filter 3.
            } else if ( ( !filter1Val && !filter2Val && filter3Val ) && ( -1 < filter3Arr.indexOf(filter3Val) ) ) {
                item.style.display = 'block';
                counter++;
            // No match.
            } else {
                item.style.display = 'none';
            }
        }

        var href = '?filter1=' + filter1Val + '&filter2=' + filter2Val;
        history.pushState({ link: href }, href, href);
    }

    /**
     * Nav event.
     */
    function clickEvent(e) {
        var link = e.target.closest('[href]');

        // If the clicked element doesn't have the right selector, bail.
        if (!link) return;

        // Skip external links.
        var target = link.getAttribute('target');
        if ('_blank' === target) return;

        e.preventDefault();
        var href = link.getAttribute('href');

        linkAction(href);
    }

    function linkAction(href) {
        var urlParams = new URLSearchParams(href);
        if (urlParams.has('action')) {
            if ('start' === urlParams.get('action')) {
                resetForm();
                view('start');
            } else {
                resetForm();
                view('list');
            }
            history.pushState({ link: href }, href, href);
        } else if (urlParams.has('filter2')) {
            filter2.value = urlParams.get('filter2');
            formSubmit();
        } else if (urlParams.has('filter3')) {
            filter3.value = urlParams.get('filter3');
            formSubmit();
        }
    }

    /**
     * Constuctor.
     * @param {*} container 
     */
    this.construct = function () {
        root = document.querySelector('#miibwnrg');

        // All href links.
        root.addEventListener('click', clickEvent);

        // Form.
        form = root.querySelector('#miibwnrgForm');
        filter1 = root.querySelector('#miibwnrgFilter1');
        filter1.addEventListener('change', formSubmit)
        filter2 = root.querySelector('#miibwnrgFilter2');
        filter2.addEventListener('change', formSubmit);
        filter3 = root.querySelector('#miibwnrgFilter3');

        start = root.querySelector('#miibwnrgStart');
        overview = root.querySelector('#miibwnrgOverview');
        listTitle = root.querySelector('#miibwnrgListTitle');
        listData = root.querySelector('#miibwnrgData');
        homeBtn = root.querySelector('#miibwnrgHomeBtn');

        // Browser back button.
        window.addEventListener('popstate', function (e) {
            linkAction(e.state.link);
        });
    };
}

var miibwnrgClass = new MiibwnrgClass();
miibwnrgClass.construct();
