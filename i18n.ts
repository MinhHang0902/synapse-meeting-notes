import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => {
    const validLocale = locale || 'en';

    try {
        const messages = (await import(`./messages/${validLocale}.json`)).default;

        return {
            locale: validLocale,
            messages
        };
    } catch (error) {
        const fallbackMessages = (await import(`./messages/en.json`)).default;
        return {
            locale: 'en',
            messages: fallbackMessages
        };
    }
});
