import * as cheerio from 'cheerio';

export class HtmlParser {
    public static extractLoginToken(html: string): string | null {
        const $ = cheerio.load(html);
        const val = $('input[name="logintoken"]').val();
        return typeof val === 'string' ? val : null;
    }

    public static extractSesskey(html: string): string | null {
        const match = html.match(/"sesskey":"([^"]+)"/);
        return match ? match[1] : null;
    }
}
