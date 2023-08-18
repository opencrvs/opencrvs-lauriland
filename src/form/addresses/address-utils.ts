/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */

import { MessageDescriptor } from 'react-intl'
import { ADMIN_LEVELS, defaultAddressConfiguration } from '.'
import {
  ISerializedForm,
  SerializedFormField,
  Event,
  Conditional,
  IPreviewGroup,
  EventLocationAddressCases,
  AddressCases,
  AllowedAddressConfigurations,
  AddressSubsections,
  AddressCopyConfigCases,
  IAddressConfiguration,
  IFormFieldMapping,
  IQueryMapper,
  IMutationMapper,
  IHandlebarTemplates
} from '../types/types'
import { getAddressFields, getXAddressSameAsY } from './address-fields'
import { getPreviewGroups } from '../common/preview-groups'
import { cloneDeep } from 'lodash'

// Use this function to edit the visibility of fields depending on user input
function getRuralOrUrbanConditionals(
  useCase: string,
  defaultConditionals: Conditional[]
) {
  let customConditionals: Conditional[] = []
  switch (ADMIN_LEVELS) {
    case 1:
      customConditionals = [
        {
          action: 'hide',
          expression: `!values.state${sentenceCase(useCase)}`
        }
      ]
      break
    case 2:
      customConditionals = [
        {
          action: 'hide',
          expression: `!values.state${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: `!values.district${sentenceCase(useCase)}`
        }
      ]
      break
    case 3:
      customConditionals = [
        {
          action: 'hide',
          expression: `!values.state${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: `!values.district${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: `!values.locationLevel3${sentenceCase(useCase)}`
        }
      ]
      break
    case 4:
      customConditionals = [
        {
          action: 'hide',
          expression: `!values.state${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: `!values.district${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: `!values.locationLevel3${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: `!values.locationLevel4${sentenceCase(useCase)}`
        }
      ]
      break
  }
  return defaultConditionals.concat(customConditionals)
}

// Use this function to edit the visibility of fields depending on user input
export function getPlaceOfEventConditionals(location: string, useCase: string) {
  switch (location) {
    case 'country':
      return [
        {
          action: 'hide',
          expression:
            useCase !== EventLocationAddressCases.PLACE_OF_MARRIAGE
              ? `(values.${useCase}!="OTHER" && values.${useCase}!="PRIVATE_HOME")`
              : ''
        }
      ]
    case 'state':
      return [
        {
          action: 'hide',
          expression: '!values.country'
        },
        {
          action: 'hide',
          expression:
            useCase !== EventLocationAddressCases.PLACE_OF_MARRIAGE
              ? `(values.${useCase}!="OTHER" && values.${useCase}!="PRIVATE_HOME")`
              : ''
        },
        {
          action: 'hide',
          expression: '!isDefaultCountry(values.country)'
        }
      ]
    case 'district':
      return [
        {
          action: 'hide',
          expression: '!values.country'
        },
        {
          action: 'hide',
          expression: '!values.state'
        },
        {
          action: 'hide',
          expression:
            useCase !== EventLocationAddressCases.PLACE_OF_MARRIAGE
              ? `(values.${useCase}!="OTHER" && values.${useCase}!="PRIVATE_HOME")`
              : ''
        },
        {
          action: 'hide',
          expression: '!isDefaultCountry(values.country)'
        }
      ]
    case 'locationLevel3':
      return [
        {
          action: 'hide',
          expression: '!values.country'
        },
        {
          action: 'hide',
          expression: '!values.state'
        },
        {
          action: 'hide',
          expression: '!values.district'
        },
        {
          action: 'hide',
          expression:
            useCase !== EventLocationAddressCases.PLACE_OF_MARRIAGE
              ? `(values.${useCase}!="OTHER" && values.${useCase}!="PRIVATE_HOME")`
              : ''
        },
        {
          action: 'hide',
          expression: '!isDefaultCountry(values.country)'
        }
      ]
    case 'locationLevel4':
      return [
        {
          action: 'hide',
          expression: '!values.country'
        },
        {
          action: 'hide',
          expression: '!values.state'
        },
        {
          action: 'hide',
          expression: '!values.district'
        },
        {
          action: 'hide',
          expression: '!values.locationLevel3'
        },
        {
          action: 'hide',
          expression:
            useCase !== EventLocationAddressCases.PLACE_OF_MARRIAGE
              ? `(values.${useCase}!="OTHER" && values.${useCase}!="PRIVATE_HOME")`
              : ''
        },
        {
          action: 'hide',
          expression: '!isDefaultCountry(values.country)'
        }
      ]
    case 'locationLevel5':
      return [
        {
          action: 'hide',
          expression: '!values.country'
        },
        {
          action: 'hide',
          expression: '!values.state'
        },
        {
          action: 'hide',
          expression: '!values.district'
        },
        {
          action: 'hide',
          expression: '!values.locationLevel3'
        },
        {
          action: 'hide',
          expression: '!values.locationLevel4'
        },
        {
          action: 'hide',
          expression:
            useCase !== EventLocationAddressCases.PLACE_OF_MARRIAGE
              ? `(values.${useCase}!="OTHER" && values.${useCase}!="PRIVATE_HOME")`
              : ''
        },
        {
          action: 'hide',
          expression: '!isDefaultCountry(values.country)'
        }
      ]
    case 'ruralOrUrban':
      return getRuralOrUrbanConditionals('', [
        {
          action: 'hide',
          expression: '!values.country'
        },
        {
          action: 'hide',
          expression:
            useCase !== EventLocationAddressCases.PLACE_OF_MARRIAGE
              ? `(values.${useCase}!="OTHER" && values.${useCase}!="PRIVATE_HOME")`
              : ''
        },
        {
          action: 'hide',
          expression: '!isDefaultCountry(values.country)'
        }
      ])
    case 'urban':
      return getRuralOrUrbanConditionals('', [
        {
          action: 'hide',
          expression: '!values.country'
        },
        {
          action: 'hide',
          expression:
            useCase !== EventLocationAddressCases.PLACE_OF_MARRIAGE
              ? `(values.${useCase}!="OTHER" && values.${useCase}!="PRIVATE_HOME")`
              : ''
        },
        {
          action: 'hide',
          expression: 'values.ruralOrUrban !== "URBAN"'
        },
        {
          action: 'hide',
          expression: '!isDefaultCountry(values.country)'
        }
      ])
    case 'rural':
      return getRuralOrUrbanConditionals('', [
        {
          action: 'hide',
          expression: '!values.country'
        },
        {
          action: 'hide',
          expression:
            useCase !== EventLocationAddressCases.PLACE_OF_MARRIAGE
              ? `(values.${useCase}!="OTHER" && values.${useCase}!="PRIVATE_HOME")`
              : ''
        },
        {
          action: 'hide',
          expression: 'values.ruralOrUrban !== "RURAL"'
        },
        {
          action: 'hide',
          expression: '!isDefaultCountry(values.country)'
        }
      ])
    case 'international':
      return [
        {
          action: 'hide',
          expression: 'isDefaultCountry(values.country)'
        },
        {
          action: 'hide',
          expression:
            useCase !== EventLocationAddressCases.PLACE_OF_MARRIAGE
              ? `(values.${useCase}!="OTHER" && values.${useCase}!="PRIVATE_HOME")`
              : ''
        }
      ]
    default:
      throw Error(
        'Supplied event location is unsupported by current conditionals'
      )
  }
}

// Use this function to edit the visibility of fields depending on user input
export function getAddressConditionals(location: string, useCase: string) {
  switch (location) {
    case 'country':
      return [
        {
          action: 'disable',
          expression: `values?.fieldsModifiedByNidUserInfo?.includes('country${sentenceCase(
            useCase
          )}')`
        }
      ]
    case 'state':
      return [
        {
          action: 'hide',
          expression: `!values.country${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: `!isDefaultCountry(values.country${sentenceCase(
            useCase
          )})`
        }
      ]
    case 'district':
      return [
        {
          action: 'hide',
          expression: `!values.country${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: `!values.state${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: `!isDefaultCountry(values.country${sentenceCase(
            useCase
          )})`
        }
      ]
    case 'locationLevel3':
      return [
        {
          action: 'hide',
          expression: `!values.country${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: `!values.state${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: `!values.district${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: `!isDefaultCountry(values.country${sentenceCase(
            useCase
          )})`
        }
      ]
    case 'locationLevel4':
      return [
        {
          action: 'hide',
          expression: `!values.country${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: `!values.state${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: `!values.district${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: `!values.locationLevel3${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: `!isDefaultCountry(values.country${sentenceCase(
            useCase
          )})`
        }
      ]
    case 'locationLevel5':
      return [
        {
          action: 'hide',
          expression: `!values.country${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: `!values.state${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: `!values.district${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: `!values.locationLevel3${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: `!values.locationLevel4${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: `!isDefaultCountry(values.country${sentenceCase(
            useCase
          )})`
        }
      ]
    case 'ruralOrUrban':
      return getRuralOrUrbanConditionals(useCase, [
        {
          action: 'hide',
          expression: `!values.country${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: `!isDefaultCountry(values.country${sentenceCase(
            useCase
          )})`
        }
      ])
    case 'urban':
      return getRuralOrUrbanConditionals(useCase, [
        {
          action: 'hide',
          expression: `!values.country${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: `values.ruralOrUrban${sentenceCase(useCase)} !== "URBAN"`
        },
        {
          action: 'hide',
          expression: `!isDefaultCountry(values.country${sentenceCase(
            useCase
          )})`
        }
      ])
    case 'rural':
      return getRuralOrUrbanConditionals(useCase, [
        {
          action: 'hide',
          expression: `!values.country${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: `values.ruralOrUrban${sentenceCase(useCase)} !== "RURAL"`
        },
        {
          action: 'hide',
          expression: `!isDefaultCountry(values.country${sentenceCase(
            useCase
          )})`
        }
      ])
    case 'international':
      return [
        {
          action: 'hide',
          expression: `isDefaultCountry(values.country${sentenceCase(useCase)})`
        }
      ]
    default:
      throw Error('Supplied location is unsupported by current conditionals')
  }
}

// ====== THE FOLLOWING UTILITY FUNCTIONS SHOULD NOT BE EDITED DURING COUNTRY CONFIGURATION! ========
// ====================== IF YOU BELIEVE THERE IS A BUG HERE, RAISE IN GITHUB! ======================

// You should never need to edit this function.  If there is a bug here raise an issue in [Github](https://github.com/opencrvs/opencrvs-farajaland)
export const sentenceCase = (str: string): string =>
  str.replace(/\w\S*/g, (txt: string) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  })

// You should never need to edit this function.  If there is a bug here raise an issue in [Github](https://github.com/opencrvs/opencrvs-farajaland)
export function getDependency(
  location: string,
  useCase: string,
  section: string
) {
  switch (location) {
    case 'state':
      return `country${sentenceCase(useCase)}${sentenceCase(section)}`
    case 'district':
      return `state${sentenceCase(useCase)}${sentenceCase(section)}`
    case 'locationLevel3':
      return `district${sentenceCase(useCase)}${sentenceCase(section)}`
    case 'locationLevel4':
      return `locationLevel3${sentenceCase(useCase)}${sentenceCase(section)}`
    case 'locationLevel5':
      return `locationLevel4${sentenceCase(useCase)}${sentenceCase(section)}`
    default:
      throw Error('Supplied address dependency is unsupported')
  }
}
// You should never need to edit this function.  If there is a bug here raise an issue in [Github](https://github.com/opencrvs/opencrvs-farajaland)
function getTemplateMapping(
  location: string,
  useCase: string,
  fieldName: string,
  locationIndex?: number
): IHandlebarTemplates {
  return useCase in EventLocationAddressCases
    ? locationIndex
      ? {
          fieldName,
          operation: 'eventLocationAddressLineTemplateTransformer',
          parameters: [locationIndex, getSupportedExtraLocationLevels(location)]
        }
      : {
          fieldName,
          operation: 'eventLocationAddressFHIRPropertyTemplateTransformer',
          parameters: [location]
        }
    : locationIndex
    ? {
        fieldName,
        operation: 'addressLineTemplateTransformer',
        parameters: [useCase, locationIndex, fieldName]
      }
    : {
        fieldName,
        operation: 'addressFHIRPropertyTemplateTransformer',
        parameters: [
          useCase.toUpperCase() === 'PRIMARY'
            ? AddressCases.PRIMARY_ADDRESS
            : AddressCases.SECONDARY_ADDRESS,
          location
        ]
      }
}

// You should never need to edit this function.  If there is a bug here raise an issue in [Github](https://github.com/opencrvs/opencrvs-farajaland)
function getMutationMapping(
  type:
    | 'TEXT'
    | 'RADIO_GROUP'
    | 'SELECT_WITH_OPTIONS'
    | 'SELECT_WITH_DYNAMIC_OPTIONS',
  location: string,
  useCase: string,
  locationIndex?: number
): IMutationMapper {
  return useCase in EventLocationAddressCases
    ? {
        operation:
          useCase === EventLocationAddressCases.PLACE_OF_BIRTH
            ? 'birthEventLocationMutationTransformer'
            : useCase === EventLocationAddressCases.PLACE_OF_DEATH
            ? 'deathEventLocationMutationTransformer'
            : 'marriageEventLocationMutationTransformer',
        parameters: [
          type === 'RADIO_GROUP'
            ? { lineNumber: locationIndex }
            : type === 'TEXT'
            ? { transformedFieldName: location }
            : { transformedFieldName: location, lineNumber: locationIndex }
        ]
      }
    : locationIndex
    ? {
        operation: 'fieldToAddressLineTransformer',
        parameters: [
          useCase.toUpperCase() === 'PRIMARY'
            ? AddressCases.PRIMARY_ADDRESS
            : AddressCases.SECONDARY_ADDRESS,
          locationIndex
        ]
      }
    : {
        operation: 'fieldToAddressFhirPropertyTransformer',
        parameters: [
          useCase.toUpperCase() === 'PRIMARY'
            ? AddressCases.PRIMARY_ADDRESS
            : AddressCases.SECONDARY_ADDRESS,
          location
        ]
      }
}

// You should never need to edit this function.  If there is a bug here raise an issue in [Github](https://github.com/opencrvs/opencrvs-farajaland)
function getQueryMapping(
  type:
    | 'TEXT'
    | 'RADIO_GROUP'
    | 'SELECT_WITH_OPTIONS'
    | 'SELECT_WITH_DYNAMIC_OPTIONS',
  location: string,
  useCase: string,
  locationIndex?: number
): IQueryMapper {
  return useCase in EventLocationAddressCases
    ? {
        operation: 'eventLocationQueryTransformer',
        parameters:
          type === 'SELECT_WITH_OPTIONS' ||
          type === 'SELECT_WITH_DYNAMIC_OPTIONS'
            ? [
                { transformedFieldName: location, lineNumber: locationIndex },
                {
                  fieldsToIgnoreForLocalAddress: [
                    `internationalDistrict${sentenceCase(useCase)}`,
                    `internationalState${sentenceCase(useCase)}`
                  ],
                  fieldsToIgnoreForInternationalAddress: [
                    `locationLevel3${sentenceCase(useCase)}`,
                    `locationLevel4${sentenceCase(useCase)}`,
                    `locationLevel5${sentenceCase(useCase)}`,
                    `district${sentenceCase(useCase)}`,
                    `state${sentenceCase(useCase)}`
                  ]
                }
              ]
            : [{ lineNumber: locationIndex }]
      }
    : locationIndex
    ? {
        operation: 'addressLineToFieldTransformer',
        parameters:
          type === 'SELECT_WITH_OPTIONS' ||
          type === 'SELECT_WITH_DYNAMIC_OPTIONS'
            ? [
                useCase.toUpperCase() === 'PRIMARY'
                  ? AddressCases.PRIMARY_ADDRESS
                  : AddressCases.SECONDARY_ADDRESS,
                locationIndex,
                location
              ]
            : [
                useCase.toUpperCase() === 'PRIMARY'
                  ? AddressCases.PRIMARY_ADDRESS
                  : AddressCases.SECONDARY_ADDRESS,
                locationIndex
              ]
      }
    : {
        operation: 'addressFhirPropertyToFieldTransformer',
        parameters: [
          useCase.toUpperCase() === 'PRIMARY'
            ? AddressCases.PRIMARY_ADDRESS
            : AddressCases.SECONDARY_ADDRESS,
          location
        ]
      }
}

// You should never need to edit this function.  If there is a bug here raise an issue in [Github](https://github.com/opencrvs/opencrvs-farajaland)
export function getMapping(
  type:
    | 'TEXT'
    | 'RADIO_GROUP'
    | 'SELECT_WITH_OPTIONS'
    | 'SELECT_WITH_DYNAMIC_OPTIONS',
  location: string, // used to filter offline locations and for FHIR props - use empty string for address lines
  useCase: string,
  fieldName: string,
  locationIndex?: number
): IFormFieldMapping {
  if (type !== 'RADIO_GROUP') {
    return {
      template: getTemplateMapping(location, useCase, fieldName, locationIndex),
      mutation: getMutationMapping(type, location, useCase, locationIndex),
      query: getQueryMapping(type, location, useCase, locationIndex)
    }
  } else {
    // Radio Groups in addresses have no need for certificate template
    return {
      mutation: getMutationMapping(type, location, useCase, locationIndex),
      query: getQueryMapping(type, location, useCase, locationIndex)
    }
  }
}

// You should never need to edit this function.  If there is a bug here raise an issue in [Github](https://github.com/opencrvs/opencrvs-farajaland)
function getSupportedExtraLocationLevels(location: string) {
  switch (location) {
    case 'locationLevel3':
      return 'locationLevel3'
    case 'locationLevel4':
      return 'locationLevel4'
    case 'locationLevel5':
      return 'locationLevel5'
    default:
      return ''
  }
}

// You should never need to edit this function.  If there is a bug here raise an issue in [Github](https://github.com/opencrvs/opencrvs-farajaland)
export function getIdentifiersFromFieldId(fieldId: string) {
  const splitIds = fieldId.split('.')
  return {
    event: splitIds[0] as Event,
    sectionId: splitIds[1],
    groupId: splitIds[2],
    fieldName: splitIds[3]
  }
}

// You should never need to edit this function.  If there is a bug here raise an issue in [Github](https://github.com/opencrvs/opencrvs-farajaland)
export function getSectionIdentifiers(fieldId: string, form: ISerializedForm) {
  const { event, sectionId } = getIdentifiersFromFieldId(fieldId)

  const sectionIndex = form.sections.findIndex(({ id }) => id === sectionId)
  return {
    event,
    sectionIndex,
    sectionId
  }
}

// You should never need to edit this function.  If there is a bug here raise an issue in [Github](https://github.com/opencrvs/opencrvs-farajaland)
export function getGroupIdentifiers(fieldId: string, form: ISerializedForm) {
  const { event, groupId } = getIdentifiersFromFieldId(fieldId)

  const { sectionIndex, sectionId } = getSectionIdentifiers(fieldId, form)

  const groups = form.sections[sectionIndex].groups

  const groupIndex = groups.findIndex(({ id }) => id === groupId)

  return {
    event,
    sectionIndex,
    sectionId,
    groupIndex
  }
}

// You should never need to edit this function.  If there is a bug here raise an issue in [Github](https://github.com/opencrvs/opencrvs-farajaland)
export function getFieldIdentifiers(fieldId: string, form: ISerializedForm) {
  const { event, fieldName } = getIdentifiersFromFieldId(fieldId)

  const { sectionIndex, groupIndex, sectionId } = getGroupIdentifiers(
    fieldId,
    form
  )

  const fields = form.sections[sectionIndex].groups[groupIndex].fields

  const fieldIndex = fields.findIndex(({ name }) => name === fieldName)

  return {
    event,
    sectionIndex,
    sectionId,
    groupIndex,
    fieldIndex
  }
}

// You should never need to edit this function.  If there is a bug here raise an issue in [Github](https://github.com/opencrvs/opencrvs-farajaland)
export const getAddressSubsection = (
  previewGroup: AddressSubsections,
  label: MessageDescriptor,
  conditionalCase?: string
): SerializedFormField[] => {
  const fields: SerializedFormField[] = []
  const subsection: SerializedFormField = {
    name: previewGroup,
    type: 'SUBSECTION_HEADER',
    label,
    previewGroup: previewGroup,
    initialValue: '',
    validator: []
  }

  if (conditionalCase) {
    subsection['conditionals'] = [
      {
        action: 'hide',
        expression: `${conditionalCase}`
      }
    ]
  }
  fields.push(subsection)
  return fields
}

// You should never need to edit this function.  If there is a bug here raise an issue in [Github](https://github.com/opencrvs/opencrvs-farajaland)
function getAddressFieldsByConfiguration(
  configuration: AllowedAddressConfigurations,
  section: string
): SerializedFormField[] {
  switch (configuration.config) {
    case EventLocationAddressCases.PLACE_OF_BIRTH:
    case EventLocationAddressCases.PLACE_OF_DEATH:
    case EventLocationAddressCases.PLACE_OF_MARRIAGE:
      return getAddressFields(section, configuration.config)
    case AddressCases.PRIMARY_ADDRESS:
      return getAddress(
        section,
        AddressCases.PRIMARY_ADDRESS,
        configuration.conditionalCase
      )
    case AddressCases.SECONDARY_ADDRESS:
      return getAddress(
        section,
        AddressCases.SECONDARY_ADDRESS,
        configuration.conditionalCase
      )
    case AddressCopyConfigCases.PRIMARY_ADDRESS_SAME_AS_OTHER_PRIMARY:
      if (
        !configuration.label ||
        !configuration.xComparisonSection ||
        !configuration.yComparisonSection
      ) {
        throw new Error(
          `Invalid address comparison case configuration for: ${configuration.config}`
        )
      }
      return getXAddressSameAsY(
        configuration.xComparisonSection,
        configuration.yComparisonSection,
        configuration.label,
        configuration.conditionalCase
      )
    case AddressSubsections.PRIMARY_ADDRESS_SUBSECTION:
    case AddressSubsections.SECONDARY_ADDRESS_SUBSECTION:
      if (!configuration.label) {
        throw new Error(
          `Invalid address subsection configuration for: ${configuration.config}`
        )
      }
      return getAddressSubsection(
        configuration.config,
        configuration.label,
        configuration.conditionalCase
      )
    default:
      return []
  }
}

// You should never need to edit this function.  If there is a bug here raise an issue in [Github](https://github.com/opencrvs/opencrvs-farajaland)
export function decorateFormsWithAddresses(
  defaultEventForm: ISerializedForm,
  event: string
): ISerializedForm {
  const newForm = cloneDeep(defaultEventForm)
  defaultAddressConfiguration.forEach(
    ({ precedingFieldId, configurations }: IAddressConfiguration) => {
      if (precedingFieldId.includes(event)) {
        const { sectionIndex, sectionId, groupIndex, fieldIndex } =
          getFieldIdentifiers(precedingFieldId, newForm)

        let addressFields: SerializedFormField[] = []
        let previewGroups: IPreviewGroup[] = []
        configurations.forEach((configuration) => {
          addressFields = addressFields.concat(
            getAddressFieldsByConfiguration(configuration, sectionId)
          )
          previewGroups = previewGroups.concat(getPreviewGroups(configuration))
        })
        newForm.sections[sectionIndex].groups[groupIndex].fields.splice(
          fieldIndex + 1,
          0,
          ...addressFields
        )

        const group = newForm.sections[sectionIndex].groups[groupIndex]
        if (group.previewGroups) {
          group.previewGroups = group.previewGroups.concat(previewGroups)
        } else {
          group.previewGroups = previewGroups
        }
      }
    }
  )

  return newForm
}

// You should never need to edit this function.  If there is a bug here raise an issue in [Github](https://github.com/opencrvs/opencrvs-farajaland)
function getAddress(
  section: string,
  addressCase: AddressCases,
  conditionalCase?: string
): SerializedFormField[] {
  const defaultFields: SerializedFormField[] = getAddressFields(
    section,
    addressCase
  )
  if (conditionalCase) {
    defaultFields.forEach((field) => {
      let conditional
      if (conditionalCase) {
        conditional = {
          action: 'hide',
          expression: `${conditionalCase}`
        }
      }
      if (
        conditional &&
        field.conditionals &&
        field.conditionals.filter(
          (conditional) => conditional.expression === conditionalCase
        ).length === 0
      ) {
        field.conditionals.push(conditional)
      } else if (conditional && !field.conditionals) {
        field.conditionals = [conditional]
      }
    })
  }
  return defaultFields
}
