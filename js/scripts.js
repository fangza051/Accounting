$(document).ready(function() {
    let gameLists = JSON.parse(localStorage.getItem('gameLists')) || [];
    let selectedGame = null;

    function loadGameList() {
        $('#gameList').empty();
        gameLists.forEach(game => {
            $('#gameList').append(`<div class="gameEntry" data-game="${game}">${game}</div>`);
        });
    }

    function saveGameList() {
        localStorage.setItem('gameLists', JSON.stringify(gameLists));
        loadGameList();
    }

    $('#addGameListBtn').on('click', function() {
        let newGame = prompt("กรุณาใส่ชื่อหมวดหมู่เกมใหม่:");
        if (newGame && !gameLists.includes(newGame)) {
            gameLists.push(newGame);
            saveGameList();
        } else {
            alert("หมวดหมู่นี้มีอยู่แล้วหรือไม่ได้ใส่ชื่อหมวดหมู่");
        }
    });

    $('#gameList').on('click', '.gameEntry', function() {
        $('.gameEntry').removeClass('selected');
        $(this).addClass('selected');
        selectedGame = $(this).data('game');
        loadDateList();  // โหลดวันที่สำหรับเกมที่เลือก
    });

    function calculateTotals() {
        let totalBuy = 0;
        let totalSell = 0;

        $('#recordTable tbody tr').each(function() {
            let transactionType = $(this).find('td:eq(0)').text().toLowerCase();
            let quantity = parseFloat($(this).find('td:eq(2)').text()) || 1;
            let price = parseFloat($(this).find('td:eq(3)').text().replace(/,/g, '')) || 0;
            let totalPrice = quantity * price;

            if (transactionType === 'buy') {
                totalBuy += totalPrice;
            } else if (transactionType === 'sell') {
                totalSell += totalPrice;
            }
        });

        let netTotal = totalSell - totalBuy;

        $('#totalBuy').text(totalBuy.toFixed(2));
        $('#totalSell').text(totalSell.toFixed(2));
        $('#netTotal').text(netTotal.toFixed(2));
    }

    function saveData(dateKey) {
        if (!selectedGame) {
            alert("กรุณาเลือกหมวดหมู่เกมก่อน!");
            return;
        }

        let data = [];
        
        $('#recordTable tbody tr').each(function() {
            let transactionType = $(this).find('td:eq(0)').text().toLowerCase();
            let productName = $(this).find('td:eq(1)').text();
            let quantity = $(this).find('td:eq(2)').text();
            let price = $(this).find('td:eq(3)').text();
            let time = $(this).find('td:eq(4)').text();
        
            if (productName && quantity && price) {
                data.push({
                    game: selectedGame,
                    transactionType: transactionType,
                    productName: productName,
                    quantity: quantity,
                    price: parseFloat(price).toFixed(2),
                    time: time
                });
            }
        });
        
        if (dateKey && !isNaN(new Date(dateKey).getTime())) {
            let gameData = JSON.parse(localStorage.getItem(selectedGame)) || {};
            gameData[dateKey] = data;
            localStorage.setItem(selectedGame, JSON.stringify(gameData));
            loadDateList();
            alert("ข้อมูลถูกบันทึกในเครื่องแล้ว!");
            calculateTotals();
        } else {
            console.error("เกิดข้อผิดพลาด: วันที่ไม่ถูกต้องหรือไม่มีการตั้งค่า");
        }
    }

    function loadData(dateKey) {
        let gameData = JSON.parse(localStorage.getItem(selectedGame)) || {};
        let savedData = gameData[dateKey] || [];
        $('#recordTable tbody').html('');
        savedData.forEach(record => {
            $('#recordTable tbody').append(`
                <tr>
                    <td>${record.transactionType.charAt(0).toUpperCase() + record.transactionType.slice(1)}</td>
                    <td>${record.productName}</td>
                    <td>${record.quantity}</td>
                    <td>${record.price}</td>
                    <td>${record.time}</td>
                    <td>
                        <button class="editBtn">แก้ไข</button>
                        <button class="deleteBtn">ลบ</button>
                    </td>
                </tr>
            `);
        });
        calculateTotals();
        highlightDate(dateKey);
        updateSelectedDateHeader(dateKey);
    }

    $('#recordTable').on('click', '.deleteBtn', function() {
        let dateKey = $('.dateEntry.selected').data('date');
        $(this).closest('tr').remove();
        calculateTotals();
        saveData(dateKey);
    });

    function highlightDate(dateKey) {
        $('.dateEntry').removeClass('selected');
        $(`.dateEntry[data-date="${dateKey}"]`).addClass('selected');
    }

    function updateSelectedDateHeader(dateKey) {
        const formattedDate = formatDateForDisplay(dateKey);
        $('#selectedDateHeader').text(`ข้อมูลสำหรับวันที่: ${formattedDate}`);
    }

    function loadDateList() {
        if (!selectedGame) {
            alert("กรุณาเลือกหมวดหมู่เกมก่อน!");
            return;
        }

        $('#dateList').html('');
        let dates = [];

        let gameData = JSON.parse(localStorage.getItem(selectedGame)) || {};
        for (let dateKey in gameData) {
            if (dateKey && !isNaN(new Date(dateKey).getTime())) {
                dates.push(dateKey);
            } else {
                console.warn("ข้ามรายการที่มีวันที่ไม่ถูกต้อง: ", dateKey);
            }
        }

        dates.sort((a, b) => new Date(a) - new Date(b));

        let lastDate = null;

        dates.forEach(dateKey => {
            let formattedDate = formatDateForDisplay(dateKey);
            $('#dateList').append(`<div class="dateEntry" data-date="${dateKey}">${formattedDate}</div>`);
            lastDate = dateKey;
        });

        let selectedDate = localStorage.getItem('selectedDate');
        if (selectedDate && dates.includes(selectedDate)) {
            loadData(selectedDate);
            highlightDate(selectedDate);
        } else if (lastDate) {
            loadData(lastDate);
            highlightDate(lastDate);
        }
    }

    $('#dateList').on('click', '.dateEntry', function() {
        let dateKey = $(this).data('date');
        localStorage.setItem('selectedDate', dateKey);
        loadData(dateKey);
        highlightDate(dateKey);
        updateSelectedDateHeader(dateKey);
    });

    function formatDateForDisplay(dateKey) {
        let date = new Date(dateKey);
        let day = String(date.getDate()).padStart(2, '0');
        let month = String(date.getMonth() + 1).padStart(2, '0');
        let year = date.getFullYear() + 543;

        return `${day}/${month}/${year}`;
    }

    $('#addRowBtn').on('click', function() {
        if (!selectedGame) {
            alert("กรุณาเลือกหมวดหมู่เกมก่อน!");
            return;
        }

        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const formattedTime = `${hours}.${minutes}`;

        $('#recordTable tbody').append(`
            <tr>
                <td>
                    <select name="transactionType">
                        <option value="buy">ซื้อ</option>
                        <option value="sell">ขาย</option>
                    </select>
                </td>
                <td><input type="text" name="productName" placeholder="ชื่อสินค้า"></td>
                <td><input type="number" name="quantity" placeholder="จำนวน"></td>
                <td><input type="number" name="price" placeholder="ราคา"></td>
                <td>${formattedTime}</td>
                <td>
                    <button class="saveBtn">บันทึก</button>
                    <button class="deleteBtn">ลบ</button>
                </td>
            </tr>
        `);
    });

    $('#recordTable').on('click', '.saveBtn', function() {
        let dateKey = $('.dateEntry.selected').data('date');
        let row = $(this).closest('tr');
        let transactionType = row.find('select[name="transactionType"]').val();
        let productName = row.find('input[name="productName"]').val();
        let quantity = row.find('input[name="quantity"]').val();
        let price = row.find('input[name="price"]').val();
        let time = row.find('td:eq(4)').text();
        
        if (productName && quantity && price) {
            row.html(`
                <td>${transactionType.charAt(0).toUpperCase() + transactionType.slice(1)}</td>
                <td>${productName}</td>
                <td>${quantity}</td>
                <td>${parseFloat(price).toFixed(2)}</td>
                <td>${time}</td>
                <td>
                    <button class="editBtn">แก้ไข</button>
                    <button class="deleteBtn">ลบ</button>
                </td>
            `);
            calculateTotals();
            saveData(dateKey);
        } else {
            alert("กรุณากรอกข้อมูลให้ครบถ้วน");
        }
    });

    $('#recordTable').on('click', '.editBtn', function() {
        let row = $(this).closest('tr');
        let transactionType = row.find('td:eq(0)').text().toLowerCase();
        let productName = row.find('td:eq(1)').text();
        let quantity = row.find('td:eq(2)').text();
        let price = row.find('td:eq(3)').text();
        let time = row.find('td:eq(4)').text();

        row.html(`
            <td>
                <select name="transactionType">
                    <option value="buy" ${transactionType === 'buy' ? 'selected' : ''}>ซื้อ</option>
                    <option value="sell" ${transactionType === 'sell' ? 'selected' : ''}>ขาย</option>
                </select>
            </td>
            <td><input type="text" name="productName" value="${productName}"></td>
            <td><input type="number" name="quantity" value="${quantity}"></td>
            <td><input type="number" name="price" value="${price}"></td>
            <td>${time}</td>
            <td><button class="saveBtn">บันทึก</button></td>
        `);
    });

    $('#exportExcelBtn').on('click', function() {
        let wb = XLSX.utils.book_new();

        gameLists.forEach(game => {
            let ws_data = [["วันที่", "ประเภท", "ชื่อสินค้า", "จำนวน", "ราคา", "เวลา"]];
            let gameData = JSON.parse(localStorage.getItem(game)) || {};

            for (let dateKey in gameData) {
                let records = gameData[dateKey];
                records.forEach(record => {
                    ws_data.push([
                        dateKey,
                        record.transactionType,
                        record.productName,
                        record.quantity,
                        record.price,
                        record.time
                    ]);
                });
            }

            let ws = XLSX.utils.aoa_to_sheet(ws_data);
            XLSX.utils.book_append_sheet(wb, ws, game);
        });

        XLSX.writeFile(wb, "purchase_sales_data.xlsx");
    });

    $('#importExcelBtn').on('change', function(event) {
        let file = event.target.files[0];
        let reader = new FileReader();

        reader.onload = function(e) {
            let data = new Uint8Array(e.target.result);
            let workbook = XLSX.read(data, {type: 'array'});

            workbook.SheetNames.forEach(sheetName => {
                let gameData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {header: 1});
                let game = sheetName;
                let gameStorage = {};

                gameData.forEach((row, index) => {
                    if (index === 0) return;

                    let dateKey = excelDateToJSDate(row[0]);
                    if (dateKey !== 'Invalid Date') {
                        dateKey = dateKey.toISOString().split('T')[0];

                        let record = {
                            transactionType: row[1],
                            productName: row[2],
                            quantity: row[3],
                            price: row[4],
                            time: row[5]
                        };

                        if (gameStorage[dateKey]) {
                            gameStorage[dateKey].push(record);
                        } else {
                            gameStorage[dateKey] = [record];
                        }
                    } else {
                        console.warn(`Skipping invalid date row: ${row}`);
                    }
                });

                localStorage.setItem(game, JSON.stringify(gameStorage));
                if (!gameLists.includes(game)) {
                    gameLists.push(game);
                }
            });

            saveGameList();
            loadGameList();
            loadDateList();
            alert("นำเข้าข้อมูลสำเร็จ!");
        }

        reader.readAsArrayBuffer(file);
    });

    $('#createTodayRecordBtn').on('click', function() {
        if (!selectedGame) {
            alert("กรุณาเลือกหมวดหมู่เกมก่อน!");
            return;
        }

        let today = new Date();
        today.setHours(today.getHours() + 7);
        let todayDateKey = today.toISOString().split('T')[0];

        let gameData = JSON.parse(localStorage.getItem(selectedGame)) || {};
        if (!gameData[todayDateKey]) {
            gameData[todayDateKey] = [];
            localStorage.setItem(selectedGame, JSON.stringify(gameData));
            loadDateList();
            alert("สร้างบันทึกสำหรับวันนี้แล้ว!");
        } else {
            alert("มีบันทึกสำหรับวันนี้อยู่แล้ว");
        }
    });

    $('#resetAllBtn').on('click', function() {
        if (confirm("คุณแน่ใจหรือว่าต้องการรีเซ็ตข้อมูลทั้งหมด?")) {
            localStorage.clear();
            gameLists = [];
            selectedGame = null;
            $('#recordTable tbody').html('');
            saveGameList();
            loadGameList();
            $('#dateList').html('');
            alert("ข้อมูลทั้งหมดถูกรีเซ็ตแล้ว!");
        }
    });

    loadGameList();

    function excelDateToJSDate(serial) {
        if (typeof serial === 'string') {
            let date = new Date(serial);
            if (!isNaN(date)) {
                return date;
            }
        } else if (typeof serial === 'number' && serial > 0) {
            var date = new Date(Math.round((serial - 25569) * 86400 * 1000));
            var utc = date.getTime() + (date.getTimezoneOffset() * 60000);
            var nd = new Date(utc + (3600000 * 7));

            if (nd.getFullYear() > 2500) {
                nd.setFullYear(nd.getFullYear() - 543);
            }
            
            return nd;
        }
        return new Date('Invalid Date');
    }
    // $('#exportPngBtn').on('click', function() {
    //     html2canvas(document.querySelector("#summarySection")).then(canvas => {
    //         // สร้างลิงก์ดาวน์โหลด
    //         let link = document.createElement('a');
    //         link.href = canvas.toDataURL("image/png");
    //         link.download = `${selectedGame}_summary.png`;
    //         link.click();
    //     });
    // });

    $('#exportPngBtn').on('click', function() {
        // ซ่อนคอลัมน์ "การดำเนินการ" ก่อนจับภาพ
        $('#recordTable th:last-child, #recordTable td:last-child').hide();

        html2canvas(document.querySelector("#summarySection")).then(canvas => {
            // แสดงคอลัมน์ "การดำเนินการ" กลับมา
            $('#recordTable th:last-child, #recordTable td:last-child').show();

            // สร้างลิงก์ดาวน์โหลด
            let link = document.createElement('a');
            link.href = canvas.toDataURL("image/png");
            link.download = `${selectedGame}_summary.png`;
            link.click();
        });
    });
});
