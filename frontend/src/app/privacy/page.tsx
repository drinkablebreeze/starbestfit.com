import { Metadata } from 'next'

import GoogleTranslate from '/src/app/privacy/GoogleTranslate'
import Button from '/src/components/Button/Button'
import Content from '/src/components/Content/Content'
import Footer from '/src/components/Footer/Footer'
import Header from '/src/components/Header/Header'
import { P } from '/src/components/Paragraph/Text'
import Section from '/src/components/Section/Section'
import { useTranslation } from '/src/i18n/server'

import styles from './page.module.scss'

export const generateMetadata = async (): Promise<Metadata> => {
  const { t } = await useTranslation('privacy')

  return {
    title: t('name'),
  }
}

const Page = async () => {
  const { t, i18n } = await useTranslation(['common', 'privacy'])

  return <>
    <Content>
      <Header />

      <h1>{t('privacy:name')}</h1>

      {!i18n.language.startsWith('en') && <GoogleTranslate language={i18n.language}>{t('privacy:translate')}</GoogleTranslate>}

      <div id="policy">
        <p className={styles.note}>This policy applies to the Star Fit instance available at <a href="https://starbestfit.com">starbestfit.com</a>. If you want to manage your own data, you can <a href="https://github.com/drinkablebreeze/starbestfit.com/blob/main/wiki/Self%E2%80%90hosting.md">host your own instance</a>.</p>
        <P>Star Fit stores your event details and scheduling preferences in order to function. Your preferences are the scores that you give to each possible time for an event, and are visible to other people with the event link. Consider whether your preferences will reveal sensitive information before sharing them.</P>
        <P>Your event data is communicated to and from the Star Fit server using an encrypted connection (HTTPS). Event data is stored unencrypted when at rest, but access is protected. The admins of this Star Fit instance do not inspect your stored event data or share it with other people. Events will be permanently erased from storage after <strong>3 months</strong> of inactivity.</P>
        <P>In the case of an error, data is collected to improve the service, which may include your IP address, device name, operating system version, app configuration, and the time and date of the error.</P>
        <P>The Star Fit server and database are hosted with <a href="https://www.digitalocean.com/">DigitalOcean</a> in the United States. <a href="https://www.cloudflare.com/">Cloudflare</a> is used for website content delivery and to prevent bot attacks. Cloudflare examines your connection details and stores temporary cookies in your web browser to provide these functions. For more, see Cloudflare's <a href="https://www.cloudflare.com/privacypolicy/" target="blank">privacy policy</a> and <a href="https://developers.cloudflare.com/fundamentals/reference/policies-compliances/cloudflare-cookies/" target="blank">cookie policy</a>.</P>
        <P>To enter your preferences more easily, you can import your availability from Google Calendar. After logging in and selecting the calendar to import from, Star Fit retrieves the times that you are busy or free, sets busy times to zero stars, and sets free times to five stars. From there you can further edit your scores to better reflect your preferences beyond just your free/busy availability. Star Fit only stores your most recent preferences and does not collect other data from your Google account. Your preferences will be visible to other people with the event link.</P>

        <P>Last updated: 2024-10-31</P>

        <h2>Contact Us</h2>
        <P>If you have any questions or suggestions about the privacy policy, do not hesitate to contact us <a href="https://github.com/drinkablebreeze/starbestfit.com/issues">here</a>.</P>
      </div>
    </Content>

    <Section>
      <Content isCentered>
        <Button href="/">{t('common:cta')}</Button>
      </Content>
    </Section>

    <Footer />
  </>
}

export default Page
