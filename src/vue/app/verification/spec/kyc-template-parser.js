import { userTypes } from '../../../../js/const/const'
import { wrapDocuments } from '../../../../js/helpers/DocumentContainer'
export class KycTemplateParser {
  static fromTemplate (template, type) {
    switch (type) {
      case userTypes.general:
        return {
          firstName: template.first_name,
          lastName: template.last_name
        }
      case userTypes.syndicate:
        return {
          name: template.name,
          socials: {
            telegram: template.socials ? template.socials.telegram : null
          },
          dateOfBirth: template.date_of_birth,
          education: template.education,
          exhibition: template.exhibition,
          direction: template.direction,
          about: template.about,
          documents: wrapDocuments(template.documents)
        }
    }
  }

  static toTemplate (form, type) {
    switch (type) {
      case userTypes.general:
        return {
          first_name: form.firstName,
          last_name: form.lastName
        }
      case userTypes.syndicate:
        return {
          name: form.name,
          socials: {
            telegram: form.socials.telegram
          },
          date_of_birth: form.dateOfBirth,
          education: form.education,
          exhibition: form.exhibition,
          direction: form.direction,
          about: form.about
        }
    }
  }

  static getSaveableDocuments (documents) {
    const result = {}
    console.log(Object.entries(documents))
    for (const [type, doc] of Object.entries(documents)) {
      result[type] = doc.getDetailsForSave()
    }
    return result
  }
}
