function autoResize(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = (textarea.scrollHeight) + 'px';
}

function handleImageUpload(event, imgId, charNum) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imgElement = document.getElementById(imgId);
            imgElement.src = e.target.result;
            imgElement.style.display = 'block';
            imgElement.previousElementSibling.style.display = 'none';
            saveDataToLocalStorage();
        }
        reader.readAsDataURL(file);
    }
}

document.getElementById('bgColorPicker').addEventListener('input', (e) => {
    document.documentElement.style.setProperty('--bg-color', e.target.value);
    saveDataToLocalStorage();
});

document.getElementById('textColorPicker').addEventListener('input', (e) => {
    document.documentElement.style.setProperty('--text-color', e.target.value);
    saveDataToLocalStorage();
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
                    onblur="if(this.value==='') this.value='노래 제목 입력'; saveDataToLocalStorage();"
                    oninput="saveDataToLocalStorage()">
                <input type="text" class="song-artist-input" value="${artist}" placeholder="가수 이름" 
                    onfocus="if(this.value==='가수 이름 입력') this.value=''" 
                    onblur="if(this.value==='') this.value='가수 이름 입력'; saveDataToLocalStorage();"
                    oninput="saveDataToLocalStorage()">
            </div>
            <button class="delete-btn" onclick="this.closest('.playlist-item').remove(); saveDataToLocalStorage();">×</button>
        </div>
        <div class="memo-container ${!memo && isLocked ? 'hidden' : ''}">
            <textarea class="memo-input ${isLocked ? 'locked' : ''}" placeholder="이 노래를 고른 이유는? (선택사항)" ${isLocked ? 'readonly' : ''}>${memo}</textarea>
            <button class="memo-btn" onclick="toggleMemo(this)">${isLocked ? '수정' : '확인'}</button>
        </div>
    `;
    
    playlistContainer.appendChild(playItem);
    if (!songData) saveDataToLocalStorage();
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
    saveDataToLocalStorage();
}

function saveDataToLocalStorage() {
    const data = {
        bgColor: document.getElementById('bgColorPicker').value,
        textColor: document.getElementById('textColorPicker').value,
        pairName: document.getElementById('pairNameInput').value,
        charName1: document.getElementById('charName1').value,
        quote1: document.getElementById('quote1').value,
        img1: document.getElementById('img-char1').src,
        charName2: document.getElementById('charName2').value,
        quote2: document.getElementById('quote2').value,
        img2: document.getElementById('img-char2').src,
        playlist1: getPlaylistData(1),
        playlist2: getPlaylistData(2)
    };
    localStorage.setItem('charPlaylistData', JSON.stringify(data));
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
    const saved = localStorage.getItem('charPlaylistData');
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

// 캡처 시 입력창들을 완벽한 텍스트 div로 변환하여 잘림 현상 원천 차단
async function saveAsImage() {
    const saveBtn = document.getElementById('saveBtn');
    saveBtn.innerText = '저장 중... ⏳';
    document.body.classList.add('saving');
    
    window.scrollTo(0, 0);
    
    // 입력창들을 일반 텍스트 스타일의 div로 치환하기 위한 백업 배열
    const inputsToSwap = document.querySelectorAll('.pair-name-input, .char-name-input, .quote-input, .song-title-input, .song-artist-input, .memo-input');
    const swappedElements = [];

    inputsToSwap.forEach(input => {
        const div = document.createElement('div');
        div.className = input.className + '-swapped';
        div.innerText = input.value || input.placeholder;
        
        // computed style 복사
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
            div.style.borderBottom = '2px solid var(--text-color)';
            div.style.paddingBottom = '8px';
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
        // 치환했던 요소를 원래대로 원복
        swappedElements.forEach(item => {
            item.input.style.display = '';
            item.div.remove();
        });
        document.body.classList.remove('saving');
        saveBtn.innerText = '이미지로 저장 📸';
    }
}