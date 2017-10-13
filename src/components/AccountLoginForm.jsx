import styles from '../styles/accountLoginForm'

import React from 'react'
import classNames from 'classnames'
import statefulForm from '../lib/statefulForm'
import { translate } from 'cozy-ui/react/I18n'
import Field, { PasswordField, DropdownField, CheckboxField, isHidden, isAdvanced } from './Field'
import ReactMarkdownWrapper from './ReactMarkdownWrapper'

const AccountLoginForm = ({ t, isOAuth, oAuthTerminated, fields, error, dirty, submitting, forceDisabled, forceEnabled, values, submit, connectorSlug, isSuccess, disableSuccessTimeout, isUnloading }) => {
  const isUpdate = !!values && Object.keys(values).length > 0
  let alreadyFocused = false
  const editableFields = Object.keys(fields)
    .filter(name => !isHidden(fields[name]) && !isAdvanced(fields[name]))
    .map(name => ({ ...fields[name], name }))
  const hasEditableFields = !!editableFields.length
  const submitEnabled = dirty || (isOAuth && !(isUpdate && hasEditableFields)) || forceEnabled
  return (
    <div className={styles['account-form-login']}>
      {error &&
        <p className='errors'>
          {t('account.message.error.bad_credentials')}
        </p>}
      {!!editableFields && editableFields
        .map((field) => {
          const { name } = field
          const readOnly = name === 'login' && isUpdate
          const giveFocus = !alreadyFocused && !readOnly
          if (giveFocus) alreadyFocused = giveFocus
          const inputName = `${name}_${connectorSlug}`
          const description = field.hasDescription
            ? <ReactMarkdownWrapper source={t(`connector.${connectorSlug}.description.field.${name}`)} />
            : null
          const onEnterKey = () => {
            if (((!isUpdate || hasEditableFields) && !isSuccess) && !submitting && submitEnabled) submit()
          }
          const label = t(`account.form.label.${name}`)
          return <div>
            {description}
            { (() => {
              switch (field.type) {
                case 'password':
                  return <PasswordField
                      label={label}
                      name={inputName}
                      placeholder={t('account.form.placeholder.password')}
                      invalid={!!error}
                      giveFocus={giveFocus}
                      onEnterKey={onEnterKey}
                      noAutoFill
                      {...field}
                      value={isUnloading ? '' : field.value} />
                case 'dropdown':
                  return <DropdownField label={label} {...field} />
                case 'checkbox':
                  // force boolean type here since it's just a checkbox
                  field.value = !!field.value
                  return <CheckboxField label={label} {...field} />
                default:
                  return <Field
                      label={label}
                      name={inputName}
                      readOnly={readOnly}
                      invalid={!!error}
                      giveFocus={giveFocus && !readOnly}
                      onEnterKey={onEnterKey}
                      noAutoFill
                      {...Object.assign({}, field, {
                        value: isUnloading ? '' : field.value
                      })}
                    />
              }
            })() }
          </div>
        }
      )}

      <div className={styles['coz-form-controls']}>
        { ((!isUpdate || hasEditableFields) && !isSuccess) &&
          <button
            className={classNames('coz-btn', 'coz-btn--regular', styles['coz-btn'])}
            disabled={forceDisabled || submitting || !(submitEnabled)}
            aria-busy={submitting && !disableSuccessTimeout && (isUpdate || !isOAuth || oAuthTerminated) ? 'true' : 'false'}
            onClick={submit}
          >
            {t(isUpdate ? 'account.form.button.save' : 'account.form.button.connect')}
          </button>
        }
      </div>
    </div>
  )
}

export default statefulForm()(translate()(AccountLoginForm))
