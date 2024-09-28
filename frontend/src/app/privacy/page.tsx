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
        <P>Star Fit stores your event names, event times, usernames, and scheduling preferences in order to function. When you use passwords to prevent unauthorized edits to your preferences, your passwords are securely hashed and only the hashes are stored.</P>
        <P>Your event data is communicated to and from the Star Fit server using an encrypted connection (HTTPS). Event data is stored unencrypted when at rest, but access is protected.</P>
        <P>The admins of this Star Fit instance do not inspect your stored event data or share it with other people. Events will be permanently erased from storage after <strong>3 months</strong> of inactivity.</P>
        <P>In the case of an error, data is collected to improve the service, which may include your IP address, device name, operating system version, app configuration, and the time and date of the error.</P>
        <P>The Star Fit server and database are hosted with <a href="https://www.digitalocean.com/">DigitalOcean</a> in the United States.</P>
        <P><a href="https://www.cloudflare.com/">Cloudflare</a> is used for website content delivery and to prevent bot attacks. Cloudflare examines your connection details and stores temporary cookies in your web browser to provide these functions. For more, see Cloudflare's <a href="https://www.cloudflare.com/privacypolicy/" target="blank">privacy policy</a> and <a href="https://developers.cloudflare.com/fundamentals/reference/policies-compliances/cloudflare-cookies/" target="blank">cookie policy</a>.</P>

        <P>Last updated: 2024-09-27</P>

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
