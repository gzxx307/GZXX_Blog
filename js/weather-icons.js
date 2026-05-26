/**
 * 天气图标 SVG 内容定义及 WMO 天气码映射。
 */

// 各天气类型对应的 SVG 内部元素字符串
const WEATHER_ICONS = {

    // 晴天
    clear: `
        <circle class="sun-core" cx="12" cy="12" r="5" stroke="white" stroke-width="1.5" fill="none"/>
        <g class="sun-rays" transform-origin="12 12">
            <line class="sun-ray" x1="12" y1="1"  x2="12" y2="3"  stroke="white" stroke-width="1.5" stroke-linecap="round"/>
            <line class="sun-ray" x1="12" y1="21" x2="12" y2="23" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
            <line class="sun-ray" x1="1"  y1="12" x2="3"  y2="12" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
            <line class="sun-ray" x1="21" y1="12" x2="23" y2="12" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
            <line class="sun-ray" x1="4.22"  y1="4.22"  x2="5.64"  y2="5.64"  stroke="white" stroke-width="1.5" stroke-linecap="round"/>
            <line class="sun-ray" x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
            <line class="sun-ray" x1="4.22"  y1="19.78" x2="5.64"  y2="18.36" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
            <line class="sun-ray" x1="18.36" y1="5.64"  x2="19.78" y2="4.22"  stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        </g>
    `,

    // 多云
    partlyCloudy: `
        <circle class="sun-core" cx="20" cy="5" r="3" stroke="white" stroke-width="1.5" fill="none"/>
        <line class="sun-ray" x1="24.7"   y1="4.5" x2="25.3" y2="4"   stroke="white" stroke-width="1.2" stroke-linecap="round"/>
        <line class="sun-ray" x1="23.4" y1="2.2" x2="24" y2="1.4" stroke="white" stroke-width="1.2" stroke-linecap="round"/>
        <line class="sun-ray" x1="21.3" y1="0.5" x2="21.8" y2="0" stroke="white" stroke-width="1.2" stroke-linecap="round"/>
        <path class="cloud-group" d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"
              stroke="white" stroke-width="1.5" fill="none" stroke-linejoin="round"/>
    `,

    // 阴天
    cloudy: `
        <path class="cloud-group" d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"
              stroke="white" stroke-width="1.5" fill="none" stroke-linejoin="round"/>
    `,

    // 雾
    fog: `
        <line class="fog-line" x1="3" y1="7"  x2="21" y2="7"  stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        <line class="fog-line" x1="3" y1="12" x2="21" y2="12" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        <line class="fog-line" x1="3" y1="17" x2="21" y2="17" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
    `,

    // 毛毛雨
    drizzle: `
        <path class="cloud-group" d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"
              stroke="white" stroke-width="1.5" fill="none" stroke-linejoin="round"/>
        <line class="raindrop" x1="9"  y1="17" x2="7"  y2="21" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        <line class="raindrop" x1="15" y1="17" x2="13" y2="21" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
    `,

    // 雨
    rain: `
        <path class="cloud-group" d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"
              stroke="white" stroke-width="1.5" fill="none" stroke-linejoin="round"/>
        <line class="raindrop" x1="8"  y1="17" x2="6"  y2="21" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        <line class="raindrop" x1="13" y1="17" x2="11" y2="21" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        <line class="raindrop" x1="18" y1="17" x2="16" y2="21" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
    `,

    // 雪
    snow: `
        <path class="cloud-group" d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"
              stroke="white" stroke-width="1.5" fill="none" stroke-linejoin="round"/>
        <g class="snowflake sf-1">
            <line x1="6"  y1="20" x2="10" y2="20" stroke="white" stroke-width="0.8" stroke-linecap="round"/>
            <line x1="8"  y1="18" x2="8"  y2="22" stroke="white" stroke-width="0.8" stroke-linecap="round"/>
            <line x1="6.6" y1="18.6" x2="9.4" y2="21.4" stroke="white" stroke-width="0.8" stroke-linecap="round"/>
            <line x1="6.6" y1="21.4" x2="9.4" y2="18.6" stroke="white" stroke-width="0.8" stroke-linecap="round"/>
        </g>
        <g class="snowflake sf-2">
            <line x1="14"  y1="21" x2="18" y2="21" stroke="white" stroke-width="0.8" stroke-linecap="round"/>
            <line x1="16"  y1="19" x2="16" y2="23" stroke="white" stroke-width="0.8" stroke-linecap="round"/>
            <line x1="14.6" y1="19.6" x2="17.4" y2="22.4" stroke="white" stroke-width="0.8" stroke-linecap="round"/>
            <line x1="14.6" y1="22.4" x2="17.4" y2="19.6" stroke="white" stroke-width="0.8" stroke-linecap="round"/>
        </g>
    `,

    // 雷雨：
    thunderstorm: `
        <path class="cloud-group" d="M19 16.9A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"
              stroke="white" stroke-width="1.5" fill="none" stroke-linejoin="round"/>
        <polyline class="lightning" points="13 11 9 17 15 17 11 23"
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
