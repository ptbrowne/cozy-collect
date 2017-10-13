import styles from '../styles/field.styl'

import React, { Component, cloneElement } from 'react'
import ReactDOM from 'react-dom'
import classNames from 'classnames'
import { translate } from 'cozy-ui/react/I18n'
import statefulComponent from '../lib/statefulComponent'

const Field = (props) => {
  let inputs
  if (props.children.length !== 0) {
    inputs = React.Children.toArray(props.children).map(
      child => cloneElement(child,
        Object.assign(props, {
          selected: props.value,
          className: styles['coz-field-input']
        })
      )
    )
  } else {
    const { type, placeholder, value, onChange, onInput, disabled, readOnly, name, noAutoFill } = props
    const autoFill = noAutoFill
      ? type === 'password' ? 'new-password' : 'off'
      : 'on'
    inputs = (
      <input
        type={type}
        placeholder={placeholder}
        className={styles['coz-field-input']}
        readonly={readOnly}
        disabled={disabled || readOnly}
        value={value}
        name={name}
        onChange={onChange}
        onInput={onInput}
        autocomplete={autoFill}
      />
    )
  }
  const { giveFocus } = props
  return props.type === 'hidden' ? inputs : (
    <FieldWrapper giveFocus={props.type !== 'hidden' && giveFocus} {...props}>
      {inputs}
    </FieldWrapper>
  )
}

export default Field

export class FieldWrapper extends Component {
  componentDidMount () {
    if (this.props.giveFocus) ReactDOM.findDOMNode(this).querySelector('input').focus()
  }

  handleKeyUp (ev) {
    const key = ev.which || ev.keyCode
    if (key === 13) this.props.onEnterKey()
  }

  render () {
    const { required, label, dirty, touched, invalid, errors, children } = this.props
    const classes = {
      [styles['coz-field--required']]: required === true,
      [styles['coz-field--error']]: (errors.length !== 0) || invalid,
      [styles['coz-field--dirty']]: dirty === true || touched === true
    }

    return (
      <div className={classNames(styles['coz-field'], classes)} onKeyUp={this.props.onEnterKey && this.handleKeyUp}>
        {label && <label>{label}</label>}
        {children}
        {errors.length !== 0 && errors.map((err, i) => (
          <small key={i} className={styles['coz-field-error']}>{err}</small>
        ))}
      </div>
    )
  }
}

export const PasswordField = translate()(
  statefulComponent({
    visible: false
  }, (setState) => ({
    toggleVisibility: () => {
      setState(state => ({ visible: !state.visible }))
    }
  }))(
    props => {
      const { t, placeholder, value, onChange, onInput, toggleVisibility, visible, name, giveFocus, noAutoFill } = props
      const autoFill = noAutoFill
        ? visible ? 'off' : 'new-password'
        : 'on'
      return (
        <FieldWrapper giveFocus={props.type !== 'hidden' && giveFocus} {...props}>
          <button
            type='button'
            tabindex='-1'
            title={visible ? t('field.password.visibility.title.hide') : t('field.password.visibility.title.show')}
            className={styles['password-visibility']}
            onClick={() => toggleVisibility()}
          >
            {visible
              ? t('field.password.visibility.hide')
              : t('field.password.visibility.show')
            }
          </button>
          <input
            type={visible ? 'text' : 'password'}
            placeholder={placeholder}
            className={styles['coz-field-input']}
            value={value}
            name={name}
            onChange={onChange}
            onInput={onInput}
            autocomplete={autoFill}
          />
        </FieldWrapper>
      )
    }
  )
)

export const DropdownField = translate()((props) => {
  const { value, options, onChange, onInput } = props
  let valueInOptions = options.indexOf(value) !== -1
  let dropdownFieldOptions = valueInOptions ? options : [value].concat(options)

  return (
    <FieldWrapper {...props}>
      <select
        className={styles['coz-field-dropdown']}
        value={value}
        onChange={onChange}
        onInput={onInput}
      >
        {dropdownFieldOptions.map(optionValue => (
          <option
            value={optionValue}
            selected={optionValue === {value}}
          >{optionValue}</option>
        ))}
      </select>
    </FieldWrapper>
  )
})

export const CheckboxField = translate()((props) => {
  const { value, onChange, onInput, required, label, dirty, touched, errors } = props
  let input

  if (value) {
    input = (
      <input
        type='checkbox'
        className={styles['coz-field-input-checkbox']}
        value={value}
        checked='checked'
        onChange={onChange}
        onInput={onInput}
      />
      )
  } else {
    input = (
      <input
        type='checkbox'
        className={styles['coz-field-input-checkbox']}
        value={value}
        onChange={onChange}
        onInput={onInput}
      />
      )
  }

  const conditionals = {
    'coz-field--required': required === true,
    'coz-field--error': errors.length !== 0,
    'coz-field--dirty': dirty === true || touched === true
  }

  const classes = ['coz-field'].concat(Object.keys(conditionals).filter(key => {
    return conditionals[key]
  }))

  const moduleClasses = classes.map(className => styles[className])

  return (
    <div className={classNames.apply(this, moduleClasses)}>
      {label && <label>{input} {label}</label>}
      {errors.length !== 0 && errors.map((err, i) => (
        <small key={i} className={styles['coz-field-error']}>{err}</small>
      ))}
    </div>
  )
})

export const isHidden = field => field.type && field.type === 'hidden'
export const isAdvanced = field => !!field.advanced
