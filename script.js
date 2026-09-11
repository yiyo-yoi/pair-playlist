function autoResize(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = (textarea.scrollHeight) + 'px';
}

// [사진 변경] 버튼을 눌렀을 때 파일 선택창 띄우기
function triggerFileInput(charNum) {
    document.getElementById(`file-char${charNum}`).click();
}

function handleImageUpload(event, charNum) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imgElement = document.getElementById(`img-char${charNum}`);
            imgElement.src = e.target.result;
            imgElement.style.display = 'block';
            imgElement.previousElementSibling.style.display = 'none';
            
            // 새 사진 업로드 시 위치 및 크기 초기화
            imgElement.dataset.x = 0;
            imgElement.dataset.y = 0;
            imgElement.dataset.scale = 1;
            imgElement.style.transform = `translate(0px, 0px) scale(1)`;
            
            const rangeInput = document.querySelector(`#control-container-${charNum} input[type="range"]`);
            if (rangeInput) rangeInput.value = 1;
            
            document.getElementById(`control-container-${charNum}`).style.display = 'flex';
            saveDataToStorage();
        }
        reader.readAsDataURL(file);
    }
}

// 사진 크기(줌) 조절 슬라이더
function zoomImage(event, charNum) {
    const scale = event.target.value;
    const img = document.getElementById(`img-char${charNum}`);
    const x = img.dataset.x || 0;
    const y = img.dataset.y || 0;
    
    img.dataset.scale = scale;
    img.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
    saveDataToStorage();
}

// 사진 마우스 드래그로 상하좌우 이동
function startDrag(event, charNum) {
    const img = document.getElementById(`img-char${charNum}`);
    
    // 사진이 아직 없을 때 프레임을 누르면 파일 업로드 창 띄우기
    if (img.style.display !== 'block') {
        triggerFileInput(charNum);
        return;
    }

    event.preventDefault();

    let startX = event.clientX || event.touches[0].clientX;
    let startY = event.clientY || event.touches[0].clientY;
    
    let currentX = parseFloat(img.dataset.x || 0);
    let currentY = parseFloat(img.dataset.y || 0);

    function onMove(e) {
        let clientX = e.clientX || e.touches[0].clientX;
        let clientY = e.clientY || e.touches[0].clientY;
        
        let dx = clientX - startX;
        let dy = clientY - startY;
        
        let newX = currentX + dx;
        let newY = currentY + dy;
        let scale = img.dataset.scale || 1;

        img.dataset.x = newX;
        img.dataset.y = newY;
        img.style.transform = `translate(${newX}px, ${newY}px) scale(${scale})`;
    }

    function onEnd() {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onEnd);
        window.removeEventListener('touchmove', onMove);
        window.removeEventListener('touchend', onEnd);
        saveDataToStorage();
    }

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onMove);
    window.addEventListener('touchend', onEnd);
}

document.getElementById('bgColorPicker').addEventListener('input', (e) => {
    document.documentElement.style.setProperty('--bg-color', e.target.value);
    saveDataToStorage();
});

document.getElementById('textColorPicker').addEventListener('input', (e) => {
    document.documentElement.style.setProperty('--text-color', e.target.value);
    saveDataToStorage();
});

function extractYouTubeId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

function addSongByYouTubeLink(charNum, songData = null) {
    const input = document.getElementById(`search${charNum}`);
    const playlistContainer = document.getElementById(`playlist${charNum}`);

    let thumbnailUrl, title, artist, memo, isLocked;

    if (songData) {
        thumbnailUrl = songData.thumbnailUrl;
        title = songData.title;
        artist = songData.artist;
        memo = songData.memo;
        isLocked = songData.isLocked;
    } else {
        const url = input.value.trim();
        if (!url) return;

        if (playlistContainer.children.length >= 6) {
            alert('각 캐릭터마다 최대 6곡까지 등록할 수 있습니다!');
            return;
        }

        const videoId = extractYouTubeId(url);
        if (!videoId) {
            alert('올바른 유튜브 링크를 입력해주세요!');
            return;
        }

        thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        title = "노래 제목 입력";
        artist = "가수 이름 입력";
        memo = "";
        isLocked = false;
        input.value = '';
    }

    const playItem = document.createElement('div');
    playItem.className = 'playlist-item';
    
    playItem.innerHTML = `
        <div class="playlist-item-header ${memo ? 'has-memo' : ''}">
            <img src="${thumbnailUrl}" alt="album art" data-thumb="${thumbnailUrl}">
            <div class="song-info">
                <input type="text" class="song-title-input" value="${title}" placeholder="노래 제목" 
                    onfocus="if(this.value==='노래 제목 입력') this.value=''" 
                    onblur="if(this.value==='') this.value='노래 제목 입력'; saveDataToStorage();"
                    oninput="saveDataToStorage()">
                <input type="text" class="song-artist-input" value="${artist}" placeholder="가수 이름" 
                    onfocus="if(this.value==='가수 이름 입력') this.value=''" 
                    onblur="if(this.value==='') this.value='가수 이름 입력'; saveDataToStorage();"
                    oninput="saveDataToStorage()">
            </div>
            <button class="delete-btn" onclick="this.closest('.playlist-item').remove(); saveDataToStorage();">×</button>
        </div>
        <div class="memo-container ${!memo && isLocked ? 'hidden' : ''}">
            <textarea class="memo-input ${isLocked ? 'locked' : ''}" placeholder="이 노래를 고른 이유는? (선택사항)" ${isLocked ? 'readonly' : ''}>${memo}</textarea>
            <button class="memo-btn" onclick="toggleMemo(this)">${isLocked ? '수정' : '확인'}</button>
        </div>
    `;
    
    playlistContainer.appendChild(playItem);
    if (!songData) saveDataToStorage();
}

function toggleMemo(btn) {
    const container = btn.previousElementSibling;
    const header = btn.closest('.playlist-item').querySelector('.playlist-item-header');
    
    if (btn.innerText === '확인') {
        const text = container.value.trim();
        if (text === "") {
            container.parentElement.classList.add('hidden');
            header.classList.remove('has-memo');
        } else {
            container.classList.add('locked');
            container.setAttribute('readonly', true);
            btn.innerText = '수정';
        }
    } else {
        container.classList.remove('locked');
        container.removeAttribute('readonly');
        btn.innerText = '확인';
    }
    saveDataToStorage();
}

function saveDataToStorage() {
    const img1 = document.getElementById('img-char1');
    const img2 = document.getElementById('img-char2');

    const data = {
        bgColor: document.getElementById('bgColorPicker').value,
        textColor: document.getElementById('textColorPicker').value,
        pairName: document.getElementById('pairNameInput').value,
        charName1: document.getElementById('charName1').value,
        quote1: document.getElementById('quote1').value,
        img1: img1.src,
        img1State: { x: img1.dataset.x || 0, y: img1.dataset.y || 0, scale: img1.dataset.scale || 1 },
        charName2: document.getElementById('charName2').value,
        quote2: document.getElementById('quote2').value,
        img2: img2.src,
        img2State: { x: img2.dataset.x || 0, y: img2.dataset.y || 0, scale: img2.dataset.scale || 1 },
        playlist1: getPlaylistData(1),
        playlist2: getPlaylistData(2)
    };
    sessionStorage.setItem('charPlaylistSessionData', JSON.stringify(data));
}

function getPlaylistData(charNum) {
    const items = document.querySelectorAll(`#playlist${charNum} .playlist-item`);
    const list = [];
    items.forEach(item => {
        const thumb = item.querySelector('img').dataset.thumb || item.querySelector('img').src;
        const title = item.querySelector('.song-title-input').value;
        const artist = item.querySelector('.song-artist-input').value;
        const memo = item.querySelector('.memo-input').value;
        const isLocked = item.querySelector('.memo-btn').innerText === '수정';
        list.push({ thumbnailUrl: thumb, title, artist, memo, isLocked });
    });
    return list;
}

window.addEventListener('DOMContentLoaded', () => {
    const saved = sessionStorage.getItem('charPlaylistSessionData');
    if (!saved) return;
    try {
        const data = JSON.parse(saved);
        document.getElementById('bgColorPicker').value = data.bgColor || '#f8f9fa';
        document.documentElement.style.setProperty('--bg-color', data.bgColor || '#f8f9fa');

        document.getElementById('textColorPicker').value = data.textColor || '#343a40';
        document.documentElement.style.setProperty('--text-color', data.textColor || '#343a40');

        document.getElementById('pairNameInput').value = data.pairName || '';
        
        const q1 = document.getElementById('quote1');
        q1.value = data.quote1 || '';
        autoResize(q1);

        document.getElementById('charName1').value = data.charName1 || '';
        if (data.img1) {
            const img1 = document.getElementById('img-char1');
            img1.src = data.img1;
            img1.style.display = 'block';
            img1.previousElementSibling.style.display = 'none';
            if (data.img1State) {
                img1.dataset.x = data.img1State.x;
                img1.dataset.y = data.img1State.y;
                img1.dataset.scale = data.img1State.scale;
                img1.style.transform = `translate(${data.img1State.x}px, ${data.img1State.y}px) scale(${data.img1State.scale})`;
                const range1 = document.querySelector(`#control-container-1 input[type="range"]`);
                if (range1) range1.value = data.img1State.scale;
            }
            document.getElementById('control-container-1').style.display = 'flex';
        }

        const q2 = document.getElementById('quote2');
        q2.value = data.quote2 || '';
        autoResize(q2);

        document.getElementById('charName2').value = data.charName2 || '';
        if (data.img2) {
            const img2 = document.getElementById('img-char2');
            img2.src = data.img2;
            img2.style.display = 'block';
            img2.previousElementSibling.style.display = 'none';
            if (data.img2State) {
                img2.dataset.x = data.img2State.x;
                img2.dataset.y = data.img2State.y;
                img2.dataset.scale = data.img2State.scale;
                img2.style.transform = `translate(${data.img2State.x}px, ${data.img2State.y}px) scale(${data.img2State.scale})`;
                const range2 = document.querySelector(`#control-container-2 input[type="range"]`);
                if (range2) range2.value = data.img2State.scale;
            }
            document.getElementById('control-container-2').style.display = 'flex';
        }

        if (data.playlist1) {
            data.playlist1.forEach(song => addSongByYouTubeLink(1, song));
        }
        if (data.playlist2) {
            data.playlist2.forEach(song => addSongByYouTubeLink(2, song));
        }
    } catch (e) {
        console.error('데이터 불러오기 실패:', e);
    }
});

async function saveAsImage() {
    const saveBtn = document.getElementById('saveBtn');
    saveBtn.innerText = '저장 중... ⏳';
    document.body.classList.add('saving');
    
    window.scrollTo(0, 0);
    
    const inputsToSwap = document.querySelectorAll('.pair-name-input, .char-name-input, .quote-input, .song-title-input, .song-artist-input, .memo-input');
    const swappedElements = [];

    inputsToSwap.forEach(input => {
        const div = document.createElement('div');
        div.className = input.className + '-swapped';
        div.innerText = input.value || input.placeholder;
        
        const computed = window.getComputedStyle(input);
        div.style.fontFamily = computed.fontFamily;
        div.style.fontSize = computed.fontSize;
        div.style.fontWeight = computed.fontWeight;
        div.style.textAlign = computed.textAlign;
        div.style.color = computed.color;
        div.style.lineHeight = computed.lineHeight;
        div.style.width = '100%';
        div.style.wordBreak = 'break-all';
        div.style.whiteSpace = 'pre-wrap';
        
        if (input.classList.contains('pair-name-input')) {
            div.style.borderBottom = '2px solid var(--text-color)';
            div.style.paddingBottom = '10px';
        } else if (input.classList.contains('char-name-input')) {
            div.style.borderBottom = 'none';
            div.style.marginTop = '20px';
            div.style.marginBottom = '20px';
        } else if (input.classList.contains('song-title-input')) {
            div.style.fontWeight = 'bold';
        }

        input.style.display = 'none';
        input.parentNode.insertBefore(div, input);
        swappedElements.push({ input, div });
    });

    const captureArea = document.getElementById('capture-area');
    
    try {
        const canvas = await html2canvas(captureArea, {
            scale: 2,
            useCORS: true,
            windowWidth: document.documentElement.scrollWidth,
            windowHeight: document.documentElement.scrollHeight,
            width: captureArea.offsetWidth,
            height: captureArea.offsetHeight,
            x: 0,
            y: 0,
            scrollX: 0,
            scrollY: 0,
            backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--bg-color').trim()
        });
        
        const link = document.createElement('a');
        link.download = 'character-playlist.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    } catch (err) {
        console.error('이미지 저장 실패:', err);
        alert('이미지 저장 중 오류가 발생했습니다.');
    } finally {
        swappedElements.forEach(item => {
            item.input.style.display = '';
            item.div.remove();
        });
        document.body.classList.remove('saving');
        saveBtn.innerText = '이미지로 저장 📸';
    }
}
