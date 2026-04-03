/**
 * 天气图标 SVG 内容定义及 WMO 天气码映射。
 */

// 各天气类型对应的 SVG 内部元素字符串
const WEATHER_ICONS = {

    // 晴天
    clear: `
        <circle cx="12" cy="12" r="5" stroke="white" stroke-width="1.5" fill="none"/>
        <line x1="12" y1="1"  x2="12" y2="3"  stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="12" y1="21" x2="12" y2="23" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="1"  y1="12" x2="3"  y2="12" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="21" y1="12" x2="23" y2="12" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="4.22"  y1="4.22"  x2="5.64"  y2="5.64"  stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="4.22"  y1="19.78" x2="5.64"  y2="18.36" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="18.36" y1="5.64"  x2="19.78" y2="4.22"  stroke="white" stroke-width="1.5" stroke-linecap="round"/>
    `,

    // 多云
    partlyCloudy: `
        <circle cx="20" cy="5" r="3" stroke="white" stroke-width="1.5" fill="none"/>
        <line x1="20" y1="0.5" x2="20" y2="2"   stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="15" y1="5"   x2="16.5" y2="5"  stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="17.1" y1="2.1" x2="18.1" y2="1.1" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"
              stroke="white" stroke-width="1.5" fill="none" stroke-linejoin="round"/>
    `,

    // 阴天
    cloudy: `
        <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"
              stroke="white" stroke-width="1.5" fill="none" stroke-linejoin="round"/>
    `,

    // 雾
    fog: `
        <line x1="3" y1="7"  x2="21" y2="7"  stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="3" y1="12" x2="21" y2="12" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="3" y1="17" x2="21" y2="17" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
    `,

    // 毛毛雨
    drizzle: `
        <path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"
              stroke="white" stroke-width="1.5" fill="none" stroke-linejoin="round"/>
        <line x1="9"  y1="17" x2="7"  y2="21" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="15" y1="17" x2="13" y2="21" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
    `,

    // 雨
    rain: `
        <path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"
              stroke="white" stroke-width="1.5" fill="none" stroke-linejoin="round"/>
        <line x1="8"  y1="17" x2="6"  y2="21" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="13" y1="17" x2="11" y2="21" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="18" y1="17" x2="16" y2="21" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
    `,

    // 雪
    snow: `
        <path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"
              stroke="white" stroke-width="1.5" fill="none" stroke-linejoin="round"/>
        <circle cx="8"  cy="20" r="1.3" fill="white"/>
        <circle cx="13" cy="22" r="1.3" fill="white"/>
        <circle cx="18" cy="20" r="1.3" fill="white"/>
    `,

    // 雷雨：
    thunderstorm: `
        <path d="M19 16.9A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"
              stroke="white" stroke-width="1.5" fill="none" stroke-linejoin="round"/>
        <polyline points="13 11 9 17 15 17 11 23"
                  stroke="white" stroke-width="1.5" fill="none"
                  stroke-linecap="round" stroke-linejoin="round"/>
    `,
};

/**
 * 将 WMO 天气码映射为图标键名与中文描述。
 * @param {number} code WMO 天气码
 * @returns {{ key: string, text: string }}
 */
function getWeatherInfo(code) {
    // 晴
    if (code === 0) return { key: 'clear', text: '晴天' };
    // 晴间多云
    if (code <= 2) return { key: 'partlyCloudy', text: '晴间多云' };
    // 阴
    if (code === 3) return { key: 'cloudy', text: '阴天' };
    // 雾
    if (code <= 48) return { key: 'fog', text: '有雾' };
    // 毛毛雨（含冻毛毛雨）
    if (code <= 57) return { key: 'drizzle', text: '毛毛雨' };
    // 小雨 / 冻雨
    if (code <= 67) return { key: 'rain', text: '降雨' };
    // 雪
    if (code <= 77) return { key: 'snow', text: '降雪' };
    // 阵雨
    if (code <= 82) return { key: 'rain', text: '阵雨' };
    // 阵雪
    if (code <= 86) return { key: 'snow', text: '阵雪' };
    // 雷暴
    return { key: 'thunderstorm', text: '雷暴' };
}
