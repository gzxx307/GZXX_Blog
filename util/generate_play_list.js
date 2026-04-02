// 扫描 music 文件夹，在 data 文件夹中生成 play_list.js 文件

// 获取 title, artist, src, cover
// cover 读取与 title 同名的文件，没有 cover 则返回空字符串，前端会使用默认样式

// 用于获取文件列表
const fs = require('fs');
// 用于获取文件路径
const path = require('path');
// 艺术家信息表
const { ARTISTS } = require('../musics/artists');
// 音乐目录
const musicDir = path.join(__dirname, '..\\musics');
// 获取所有音频文件
const files = fs.readdirSync(musicDir).filter(f => f.endsWith('.mp3') || f.endsWith('.wav') || f.endsWith('.ogg'));
// 获取所有封面文件
const covers = fs.readdirSync(musicDir).filter(f => f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.jpeg'));

// 生成歌单数据
const playlist = files.map(file => {
    // 根据artists.js中的常量手动添加艺术家信息
    const artistEntry = ARTISTS.find(a => a.mp3 === path.join('..\\musics', file).replace(/\\/g, '/'));
    
    const title = path.parse(file).name;
    const artist = artistEntry ? artistEntry.name : '未知艺术家';
    const src = 'musics/' + file.replace(/\\/g, '/');
    const coverFile = covers.find(c => path.parse(c).name === title);
    const cover = coverFile ? 'musics/' + coverFile.replace(/\\/g, '/') : '';
    return { title, artist, src, cover };
});

// 如果没有找到任何音乐文件，添加一个默认的占位数据
if (playlist.length === 0) {
    playlist.push({
        title: '暂无歌曲',
        artist: '未知艺术家',
        src: '',
        cover: ''
    });
}

// 将歌单数据写入 play_list.js 文件
const outputPath = path.join(__dirname, '..\\data\\play_list.js');
const fileContent = `const PLAYLIST = ${JSON.stringify(playlist, null, 4)};`;
fs.writeFileSync(outputPath, fileContent, 'utf-8');
console.log(`已生成歌单数据，文件路径：${outputPath}`);