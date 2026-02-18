import { ParamValidatorSchema } from "./template.validator";

export const templateCustomerIdParamSchema: ParamValidatorSchema = {
    customer_id: { required: true, min: 36, max: 36 }
}