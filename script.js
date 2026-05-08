document.addEventListener('DOMContentLoaded', function () {
    const HOME_URL = 'success.html';
    const form = document.getElementById('signupForm');
    const submitBtn = document.getElementById('submitBtn');
    const alertBox = document.getElementById('formAlert');
    const hp = document.getElementById('hp_website');

    // Google Apps Script endpoint - will be read from form action
    const SCRIPT_URL = form.action;

    const dateInput = document.getElementById('visit_dates');
    if (dateInput) {
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        dateInput.min = `${yyyy}-${mm}-${dd}`;
        const max = new Date(now);
        max.setFullYear(max.getFullYear() + 1);
        const maxY = max.getFullYear();
        const maxM = String(max.getMonth() + 1).padStart(2, '0');
        const maxD = String(max.getDate()).padStart(2, '0');
        dateInput.max = `${maxY}-${maxM}-${maxD}`;
    }

    const emailEl = document.getElementById('contact_email');
    const phoneEl = document.getElementById('contact_phone');
    const visitHoursEl = document.getElementById('visit_hours');
    const visitHoursSelectEl = document.getElementById('visit_hours_select');
    const visitHoursExactWrap = document.getElementById('visit_hours_exact_wrap');
    const actOtherEl = document.getElementById('act_other');
    const actOtherWrap = document.getElementById('act_other_text_wrap');
    const actOtherTextEl = document.getElementById('act_other_text');
    const actSalonEl = document.getElementById('act_salon_rent');
    const actSalonWrap = document.getElementById('act_salon_hours_wrap');
    const actSalonDetailsEl = document.getElementById('act_salon_details');
    const paymentInvoiceWrap = document.getElementById('payment_invoice_wrap');
    const paymentInvoiceNameEl = document.getElementById('payment_invoice_name');
    const paymentInvoiceEmailEl = document.getElementById('payment_invoice_email');

    function toggleVisitHoursUI() {
        if (!visitHoursEl || !visitHoursSelectEl || !visitHoursExactWrap) return;
        const v = (visitHoursSelectEl.value || '').toString();
        const isExact = v === 'exact';
        visitHoursExactWrap.style.display = isExact ? '' : 'none';
        if (!isExact) {
            visitHoursEl.value = '';
        }
    }
    function getVisitHoursLabel() {
        if (!visitHoursSelectEl) return '';
        const v = (visitHoursSelectEl.value || '').toString();
        switch (v) {
            case 'morning':
                return 'בוקר (08:00–12:00)';
            case 'noon':
                return 'צהריים (12:00–16:00)';
            case 'evening':
                return 'ערב (16:00–20:00)';
            case 'exact':
                return (visitHoursEl?.value || '').toString().trim();
            case 'unknown':
                return '';
            default:
                return '';
        }
    }
    if (visitHoursSelectEl) {
        visitHoursSelectEl.addEventListener('change', toggleVisitHoursUI);
        toggleVisitHoursUI();
    }

    function toggleOtherActivity() {
        if (!actOtherEl || !actOtherWrap) return;
        const show = !!actOtherEl.checked;
        actOtherWrap.style.display = show ? '' : 'none';
        if (!show && actOtherTextEl) actOtherTextEl.value = '';
    }
    if (actOtherEl) {
        actOtherEl.addEventListener('change', toggleOtherActivity);
        toggleOtherActivity();
    }

    function toggleSalonHours() {
        if (!actSalonWrap || !actSalonEl) return;
        const show = !!actSalonEl.checked;
        actSalonWrap.style.display = show ? '' : 'none';
        if (actSalonDetailsEl) actSalonDetailsEl.required = show;
        if (!show && actSalonDetailsEl) actSalonDetailsEl.value = '';
    }
    if (actSalonEl) {
        actSalonEl.addEventListener('change', toggleSalonHours);
        toggleSalonHours();
    }

    function togglePaymentInvoice() {
        if (!paymentInvoiceWrap) return;
        const selected = (new FormData(form).get('payment') || '').toString();
        const show = selected === 'תשלום באמצעות דרישת תשלום';
        paymentInvoiceWrap.style.display = show ? '' : 'none';
        if (paymentInvoiceNameEl) paymentInvoiceNameEl.required = show;
        if (paymentInvoiceEmailEl) paymentInvoiceEmailEl.required = show;
        if (!show) {
            if (paymentInvoiceNameEl) paymentInvoiceNameEl.value = '';
            if (paymentInvoiceEmailEl) paymentInvoiceEmailEl.value = '';
        }
    }
    togglePaymentInvoice();

    function attachInlineValidation(el, getMessage) {
        if (!el) return;
        el.addEventListener('input', () => {
            el.setCustomValidity('');
            if (!el.checkValidity()) {
                const msg = getMessage(el);
                if (msg) el.setCustomValidity(msg);
            }
        });
        el.addEventListener('invalid', () => {
            const msg = getMessage(el);
            if (msg) el.setCustomValidity(msg);
        });
    }

    attachInlineValidation(emailEl, (el) => el.validity.typeMismatch ? 'נא להזין כתובת מייל תקינה' : (el.validity.valueMissing ? 'שדה חובה' : ''));
    attachInlineValidation(phoneEl, (el) => el.validity.patternMismatch ? 'מספר טלפון ישראלי תקין (למשל 052-1234567)' : (el.validity.valueMissing ? 'שדה חובה' : ''));

    function showAlert(kind, text) {
        alertBox.className = 'p-4 rounded-lg text-center mb-4 transition-all duration-300';
        alertBox.classList.add(kind === 'success' ? 'success' : 'error');
        alertBox.textContent = text;
    }

    function collectData() {
        const data = new FormData();
        const e = config.entries;
        data.append(e.org_name, document.getElementById('org_name').value.trim());
        data.append(e.org_department, document.getElementById('org_department').value.trim());
        data.append(e.org_id, document.getElementById('org_id').value.trim());
        data.append(e.contact_name, document.getElementById('contact_name').value.trim());
        data.append(e.contact_role, document.getElementById('contact_role').value.trim());
        data.append(e.contact_email, document.getElementById('contact_email').value.trim());
        data.append(e.contact_phone, document.getElementById('contact_phone').value.trim());

        const selectedActivities = [];
        const tourEl = document.getElementById('act_tour');
        const teamEl = document.getElementById('act_workshop_team');
        const salonEl = document.getElementById('act_salon_rent');
        const eventEl = document.getElementById('act_event');
        const dayJasEl = document.getElementById('act_day_jas');
        if (tourEl?.checked) selectedActivities.push('סיור והרצאת השראה של JAS');
        if (teamEl?.checked) selectedActivities.push('סדנת הבית (מתוך מבחר סדנאות - מידע ימסר בנפרד)');
        if (salonEl?.checked) {
            const details = (document.getElementById('act_salon_details')?.value || '').toString().trim();
            selectedActivities.push(details ? `השכרת המתחם (הסלון או שטח אחר) לפעילות חד פעמית או רב פעמית – ${details}` : 'השכרת המתחם (הסלון או שטח אחר) לפעילות חד פעמית או רב פעמית');
        }
        if (eventEl?.checked) selectedActivities.push('השכרת המתחם לצורך ארוע מיוחד');
        if (dayJasEl?.checked) selectedActivities.push('יום בחיי JAS - משתתפים בתהליך המיחדוש (הפריט נשאר ב JAS)');
        if (document.getElementById('act_other').checked) {
            const otherTxt = (document.getElementById('act_other_text')?.value || '').toString().trim();
            selectedActivities.push(otherTxt || 'אחר');
        }
        // For Google Forms checkboxes, append the same entry key once per selected option
        selectedActivities.forEach(opt => data.append(e.activities, opt));

        data.append(e.visit_people, document.getElementById('visit_people').value);
        data.append(e.visit_dates, document.getElementById('visit_dates').value.trim());
        data.append(e.visit_hours, getVisitHoursLabel());

        const formFd = new FormData(form);
        const valueToLabel = {
            gift: {
                no: 'לא מעוניין',
                '60': 'כן - בשווי 60 ש"ח לאדם',
                custom: 'כן - קופסה ייעודית בהתאם לתקציב'
            },
            catering: {
                light: 'שתייה חמה בלבד',
                light_plus: 'שתייה חמה + כיבוד קל',
                full: 'שתייה חמה + כיבוד מלא לאורך הביקור'
            },
            payment: {
                bank: 'תשלום מול הספק',
                jas: 'תשלום מול JAS',
                org: 'תשלום באמצעות דרישת תשלום'
            },
            kosher: { yes: 'כן', no: 'לא' }
        };

        const gift = (formFd.get('gift') || '').toString();
        const catering = (formFd.get('catering') || '').toString();
        const payment = (formFd.get('payment') || '').toString();
        if (gift && e.gift) data.append(e.gift, valueToLabel.gift[gift] || gift);
        if (catering) data.append(e.catering, valueToLabel.catering[catering] || catering);
        if (payment) data.append(e.payment, valueToLabel.payment[payment] || payment);

        data.append(e.catering_notes, document.getElementById('catering_notes').value.trim());
        data.append(e.notes, document.getElementById('notes').value.trim());
        return data;
    }

    function collectPayload() {
        const payload = {};
        // org_type replaced org_name
        const orgTypeEl = document.getElementById('org_type');
        payload.org_type = orgTypeEl ? (orgTypeEl.value || '').toString().trim() : '';
        payload.org_exact_name = document.getElementById('org_exact_name')?.value.trim() || '';
        payload.org_department = document.getElementById('org_department').value.trim();
        payload.org_id = document.getElementById('org_id').value.trim();
        payload.contact_name = document.getElementById('contact_name').value.trim();
        payload.contact_role = document.getElementById('contact_role').value.trim();
        payload.contact_email = document.getElementById('contact_email').value.trim();
        payload.contact_phone = document.getElementById('contact_phone').value.trim();

        const selectedActivities = [];
        const tourEl2 = document.getElementById('act_tour');
        const teamEl2 = document.getElementById('act_workshop_team');
        const salonEl2 = document.getElementById('act_salon_rent');
        const eventEl2 = document.getElementById('act_event');
        const dayJasEl2 = document.getElementById('act_day_jas');
        if (tourEl2?.checked) selectedActivities.push('סיור והרצאת השראה של JAS');
        if (teamEl2?.checked) selectedActivities.push('סדנת הבית (מתוך מבחר סדנאות - מידע ימסר בנפרד)');
        if (salonEl2?.checked) {
            const details2 = (document.getElementById('act_salon_details')?.value || '').toString().trim();
            selectedActivities.push(details2 ? `השכרת המתחם (הסלון או שטח אחר) לפעילות חד פעמית או רב פעמית – ${details2}` : 'השכרת המתחם (הסלון או שטח אחר) לפעילות חד פעמית או רב פעמית');
        }
        if (eventEl2?.checked) selectedActivities.push('השכרת המתחם לצורך ארוע מיוחד');
        if (dayJasEl2?.checked) selectedActivities.push('יום בחיי JAS - משתתפים בתהליך המיחדוש (הפריט נשאר ב JAS)');
        if (document.getElementById('act_other').checked) {
            const otherTxt = (document.getElementById('act_other_text')?.value || '').toString().trim();
            selectedActivities.push(otherTxt || 'אחר');
        }
        payload.activities = selectedActivities;

        payload.visit_people = document.getElementById('visit_people').value;
        payload.visit_dates = document.getElementById('visit_dates').value.trim();
        payload.visit_hours = getVisitHoursLabel();

        const formFd = new FormData(form);
        const valueToLabel = {
            gift: {
                no: 'לא מעוניין',
                '60': 'כן - בשווי 60 ש"ח לאדם',
                custom: 'כן - קופסה ייעודית בהתאם לתקציב'
            },
            catering: {
                light: 'שתייה חמה בלבד',
                light_plus: 'שתייה חמה + כיבוד קל',
                full: 'שתייה חמה + כיבוד מלא לאורך הביקור'
            },
            payment: {
                bank: 'תשלום מול הספק',
                jas: 'תשלום מול JAS',
                org: 'תשלום באמצעות דרישת תשלום'
            },
            kosher: { yes: 'כן', no: 'לא' }
        };
        const gift = (formFd.get('gift') || '').toString();
        const catering = (formFd.get('catering') || '').toString();
        const payment = (formFd.get('payment') || '').toString();
        const kosher = (formFd.get('kosher') || '').toString();
        payload.gift = gift ? (valueToLabel.gift[gift] || gift) : '';
        // budget (only relevant when custom gift)
        const giftBudgetEl = document.getElementById('gift_budget');
        payload.gift_budget = giftBudgetEl ? giftBudgetEl.value.trim() : '';
        payload.catering = catering ? (valueToLabel.catering[catering] || catering) : '';
        payload.payment = payment ? (valueToLabel.payment[payment] || payment) : '';

        // Add payment invoice fields
        payload.payment_invoice_name = document.getElementById('payment_invoice_name')?.value.trim() || '';
        payload.payment_invoice_email = document.getElementById('payment_invoice_email')?.value.trim() || '';

        // Add conditional activity fields
        payload.act_salon_details = document.getElementById('act_salon_details')?.value.trim() || '';
        payload.act_other_text = document.getElementById('act_other_text')?.value.trim() || '';

        payload.catering_notes = document.getElementById('catering_notes').value.trim();
        payload.notes = document.getElementById('notes').value.trim();
        return payload;
    }

    form.addEventListener('submit', async (evt) => {
        // Validate; if valid, let Netlify Forms handle the POST + redirect
        evt.preventDefault();
        alertBox.classList.add('hidden');

        if (hp && hp.value) {
            // Honeypot filled -> likely bot. Silently stop.
            return;
        }

        // Validate required groups that Google Form likely marks as Required
        const activitiesChecked = [
            'act_tour', 'act_workshop_team', 'act_salon_rent', 'act_event', 'act_day_jas',
            'act_workshop_shiduch', 'act_workshop_bayit', 'act_other'
        ].some(id => document.getElementById(id)?.checked);
        const fd = new FormData(form);
        const giftSelected = !!fd.get('gift');
        const cateringSelected = !!new FormData(form).get('catering');
        const paymentFd = new FormData(form);
        const paymentSelected = !!paymentFd.get('payment');
        const paymentVal = (paymentFd.get('payment') || '').toString();

        const missing = [];
        if (!activitiesChecked) missing.push('בחירת פעילות אחת לפחות');
        if (!giftSelected) missing.push('שי ייחודי');
        if (!cateringSelected) missing.push('כיבוד');
        if (!paymentSelected) missing.push('אופן התשלום');
        // Salon rent requires details
        if (document.getElementById('act_salon_rent')?.checked) {
            const det = (document.getElementById('act_salon_details')?.value || '').toString().trim();
            if (!det) missing.push('שעות ומספר פעמים');
        }
        // Invoice payment extra validations
        if (paymentVal === 'תשלום באמצעות דרישת תשלום') {
            const invName = (paymentInvoiceNameEl?.value || '').toString().trim();
            const invEmail = (paymentInvoiceEmailEl?.value || '').toString().trim();
            if (!invName) missing.push('שם מדוייק של הלקוח');
            if (!invEmail) missing.push('כתובת מייל לדרישת תשלום');
        }
        // Extra conditional validations
        const orgType = (document.getElementById('org_type')?.value || '').toString();
        if (orgType && orgType !== 'פרטי - קבוצת חברים/משפחה') {
            if (!document.getElementById('org_department').value.trim()) missing.push('שם המחלקה בארגון');
            if (!document.getElementById('org_id').value.trim()) missing.push('ח"פ / מספר עמותה');
        }
        const giftVal = (fd.get('gift') || '').toString();
        if (giftVal === 'כן - קופסה ייעודית בהתאם לתקציב') {
            const gb = (document.getElementById('gift_budget')?.value || '').toString().trim();
            if (!gb) missing.push('תקציב לשי');
        }

        const dateVal = (document.getElementById('visit_dates')?.value || '').toString();
        if (dateVal) {
            const selected = new Date(dateVal);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (selected < today) missing.push('תאריך לא יכול להיות בעבר');
        }

        // Ask browser to surface per-field issues too
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        if (missing.length) {
            showAlert('error', 'נא למלא: ' + missing.join(', '));
            return;
        }

        // If we reached here, submit using fetch with FormData to properly handle multiple checkboxes
        submitBtn.disabled = true;
        submitBtn.textContent = 'שולח...';

        // Build FormData with all fields
        const formData = new FormData();

        // Add all form fields
        formData.append('org_type', document.getElementById('org_type')?.value || '');
        formData.append('org_exact_name', document.getElementById('org_exact_name')?.value || '');
        formData.append('org_department', document.getElementById('org_department')?.value || '');
        formData.append('org_id', document.getElementById('org_id')?.value || '');
        formData.append('contact_name', document.getElementById('contact_name')?.value || '');
        formData.append('contact_role', document.getElementById('contact_role')?.value || '');
        formData.append('contact_email', document.getElementById('contact_email')?.value || '');
        formData.append('contact_phone', document.getElementById('contact_phone')?.value || '');

        // Collect all selected activities
        const selectedActivities = [];
        if (document.getElementById('act_tour')?.checked) {
            selectedActivities.push('סיור והרצאת השראה של JAS');
        }
        if (document.getElementById('act_workshop_team')?.checked) {
            selectedActivities.push('סדנת הבית (מתוך מבחר סדנאות - מידע ימסר בנפרד)');
        }
        if (document.getElementById('act_salon_rent')?.checked) {
            const details = document.getElementById('act_salon_details')?.value?.trim() || '';
            selectedActivities.push(details ?
                `השכרת המתחם (הסלון או שטח אחר) לפעילות חד פעמית או רב פעמית – ${details}` :
                'השכרת המתחם (הסלון או שטח אחר) לפעילות חד פעמית או רב פעמית');
        }
        if (document.getElementById('act_event')?.checked) {
            selectedActivities.push('השכרת הארוע לצורך ארוע מיוחד בערב /שישי בבוקר');
        }
        if (document.getElementById('act_day_jas')?.checked) {
            selectedActivities.push('יום בחיי JAS - משתתפים בתהליך המיחדוש (הפריט נשאר ב JAS)');
        }
        if (document.getElementById('act_workshop_shiduch')?.checked) {
            selectedActivities.push('סדנת "שידוך כלים"');
        }
        if (document.getElementById('act_workshop_bayit')?.checked) {
            selectedActivities.push('סדנת "בית לייחורים"');
        }
        if (document.getElementById('act_other')?.checked) {
            const otherText = document.getElementById('act_other_text')?.value?.trim() || '';
            selectedActivities.push(otherText || 'אחר');
        }

        // Join all activities into a single comma-separated string
        formData.append('activities', selectedActivities.join(', '));

        formData.append('act_salon_details', document.getElementById('act_salon_details')?.value || '');
        formData.append('act_other_text', document.getElementById('act_other_text')?.value || '');
        formData.append('visit_people', document.getElementById('visit_people')?.value || '');
        formData.append('visit_dates', document.getElementById('visit_dates')?.value || '');
        formData.append('visit_hours', getVisitHoursLabel());

        const formFd = new FormData(form);
        formData.append('gift', formFd.get('gift') || '');
        formData.append('gift_budget', document.getElementById('gift_budget')?.value || '');
        formData.append('catering', formFd.get('catering') || '');
        formData.append('catering_notes', document.getElementById('catering_notes')?.value || '');
        formData.append('payment', formFd.get('payment') || '');
        formData.append('payment_invoice_name', document.getElementById('payment_invoice_name')?.value || '');
        formData.append('payment_invoice_email', document.getElementById('payment_invoice_email')?.value || '');
        formData.append('notes', document.getElementById('notes')?.value || '');

        // Send data to Apps Script in background, then redirect ourselves
        const params = new URLSearchParams();
        for (const [key, value] of formData.entries()) {
            params.append(key, value);
        }
        fetch(SCRIPT_URL, { method: 'POST', mode: 'no-cors', keepalive: true, body: params });
        window.location.href = HOME_URL;
    });

    // UI toggles
    const orgTypeEl = document.getElementById('org_type');
    const socialWrap = document.getElementById('org_social_fields');
    function toggleOrgSocial() {
        if (!orgTypeEl || !socialWrap) return;
        const val = (orgTypeEl.value || '').toString();
        const show = val && val !== 'פרטי - קבוצת חברים/משפחה';
        socialWrap.style.display = show ? '' : 'none';
        if (!show) {
            document.getElementById('org_department').value = '';
            document.getElementById('org_id').value = '';
        }
    }
    orgTypeEl?.addEventListener('change', toggleOrgSocial);
    toggleOrgSocial();

    const giftBudgetWrap = document.getElementById('gift_budget_wrap');
    function toggleGiftBudget() {
        const val = (new FormData(form).get('gift') || '').toString();
        const show = val === 'כן - קופסה ייעודית בהתאם לתקציב';
        if (giftBudgetWrap) {
            giftBudgetWrap.style.display = show ? '' : 'none';
        }
        if (!show) {
            const gb = document.getElementById('gift_budget');
            if (gb) gb.value = '';
        }
    }
    form.addEventListener('change', (e) => {
        if (e.target && e.target.name === 'gift') toggleGiftBudget();
        if (e.target && e.target.name === 'payment') togglePaymentInvoice();
    });
    toggleGiftBudget();
    togglePaymentInvoice();
});
