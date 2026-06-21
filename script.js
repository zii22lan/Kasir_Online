let cart = [];
let grandTotal = 0;

const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbzl6RSabspY8hS3NHW2NQQ-E7lK2KtBDham9cIHFQ-58zJmc9APQFh_I2UXMvaIwPdKkw/exec"; 

function addToCart(itemName, basePrice) {
    // 1. INPUT QUANTITY
    let qtyPrompt = prompt(`Berapa BOX ${itemName} yang ingin dibeli?`, "1");
    let qty = parseInt(qtyPrompt);
    if (isNaN(qty) || qty <= 0) return; 

    // 2. INPUT TOPPING PER BOX
    let toppingPrompt = prompt(`Berapa TOTAL TOPPING untuk SETIAP BOX?\n(1 Topping Gratis. Jika double/lebih, tambahan dikenakan Rp2.000 per 1 topping tambahan)`, "0");
    let toppingCount = parseInt(toppingPrompt);
    if (isNaN(toppingCount) || toppingCount < 0) {
        toppingCount = 0;
    }

    let extraToppingChargePerBox = toppingCount > 1 ? (toppingCount - 1) * 2000 : 0;
    let pricePerBox = basePrice + extraToppingChargePerBox;
    let totalLinePrice = pricePerBox * qty;

    cart.push({
        name: itemName,
        basePrice: basePrice,
        qty: qty,
        toppings: toppingCount,
        extraChargePerBox: extraToppingChargePerBox,
        totalItemPrice: totalLinePrice
    });

    grandTotal += totalLinePrice;
    renderCart();
}

function renderCart() {
    const cartList = document.getElementById("cart-list");
    const totalPriceEl = document.getElementById("total-price");

    if (cart.length === 0) {
        cartList.innerHTML = `<li class="empty-state">Belum ada item terpilih</li>`;
        totalPriceEl.innerText = "0";
        return;
    }

    cartList.innerHTML = cart.map((item, index) => {
        let toppingText = item.toppings > 0 ? `(+${item.toppings} Top)` : '(Tanpa Top)';
        return `
            <li class="receipt-row">
                <span class="receipt-col-left">${index + 1}. ${item.name} ${toppingText} <b>x${item.qty}</b></span>
                <span class="receipt-col-right">Rp ${item.totalItemPrice.toLocaleString('id-ID')}</span>
            </li>
        `;
    }).join('');

    totalPriceEl.innerText = grandTotal.toLocaleString('id-ID');
}

function checkoutProcess() {
    if (cart.length === 0) {
        alert("Keranjang masih kosong!");
        return;
    }

    let orderSummaryText = cart.map(i => `${i.name} x${i.qty}(Top:${i.toppings})`).join(", ");

    // Kirim data ke Excel/Google Sheet tanpa mengganggu tampilan kasir
    fetch(SHEET_API_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            orderList: orderSummaryText,
            totalPrice: grandTotal
        })
    });

    showReceiptModal();
}

function showReceiptModal() {
    const receiptItems = document.getElementById("receipt-items");
    
    let itemsHTML = cart.map(item => `
        <div class="receipt-row">
            <span class="receipt-col-left">${item.name} <b>x${item.qty}</b></span>
            <span class="receipt-col-right">Rp ${(item.basePrice * item.qty).toLocaleString('id-ID')}</span>
        </div>
        ${item.extraChargePerBox > 0 ? `
        <div class="receipt-row" style="color: #7d665c; font-size: 11px;">
            <span class="receipt-col-left">&nbsp;&nbsp;+ Extra ${item.toppings - 1} Topping (x${item.qty})</span>
            <span class="receipt-col-right">Rp ${(item.extraChargePerBox * item.qty).toLocaleString('id-ID')}</span>
        </div>` : ''}
    `).join('');

    itemsHTML += `
        <div class="dashed-line"></div>
        <div class="receipt-row" style="font-size: 16px; font-weight: 700;">
            <span class="receipt-col-left">TOTAL</span>
            <span class="receipt-col-right">Rp ${grandTotal.toLocaleString('id-ID')}</span>
        </div>
    `;

    receiptItems.innerHTML = itemsHTML;
    document.getElementById("receiptModal").style.display = "block";
}

function resetApp() {
    cart = [];
    grandTotal = 0;
    renderCart();
    document.getElementById("receiptModal").style.display = "none";
}