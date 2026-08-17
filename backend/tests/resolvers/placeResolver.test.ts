import PlaceRepository from "../../src/repositories/placeRepository";
import { UserTypeEnum } from "../../src/enums/userTypesEnum";
import { execute, contextAs, firstError } from "./helpers";

jest.mock("../../src/repositories/placeRepository");

const mockCreate = PlaceRepository.prototype.create as jest.Mock;
const mockFindByPk = PlaceRepository.prototype.findByPk as jest.Mock;
const mockUpdateOne = PlaceRepository.prototype.updateOne as jest.Mock;

const VALID_INPUT = {
  label: "The Test Cafe",
  address: "123 Test Street",
  phone: "+15550100",
  categoryId: 1,
};

const CREATE_PLACE = `
  mutation CreatePlace($input: InputPlace) {
    createPlace(input: $input) { message data { id label address } }
  }
`;

const UPDATE_PLACE = `
  mutation UpdatePlace($placeId: Int!, $input: InputPlace) {
    updatePlace(placeId: $placeId, input: $input) { message data { id label } }
  }
`;

describe("placeResolver (GraphQL execution)", () => {
  describe("createPlace", () => {
    it("creates a place for a BUSINESS caller", async () => {
      mockCreate.mockResolvedValue({ id: 10, ...VALID_INPUT });

      const result = await execute(CREATE_PLACE, {
        variableValues: { input: VALID_INPUT },
        context: contextAs("5", UserTypeEnum.BUSINESS),
      });

      expect(result.errors).toBeUndefined();
      expect((result.data?.createPlace as any).data.label).toBe(VALID_INPUT.label);
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({ ownerId: "5", ...VALID_INPUT }),
        expect.anything()
      );
    });

    // requireOwner is a role check (BUSINESS vs REGULAR), not resource
    // ownership - doc 2's issue 2 was this check being missing/wrong
    // entirely. A real GraphQL execution confirms the resolver actually
    // calls it, not just that the helper function works in isolation.
    it("rejects a REGULAR caller with UNAUTHORIZED", async () => {
      const result = await execute(CREATE_PLACE, {
        variableValues: { input: VALID_INPUT },
        context: contextAs("5", UserTypeEnum.REGULAR),
      });

      expect(result.data?.createPlace).toBeNull();
      expect(firstError(result.errors).extensions.code).toBe("UNAUTHORIZED");
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it("rejects an unauthenticated caller", async () => {
      const result = await execute(CREATE_PLACE, { variableValues: { input: VALID_INPUT }, context: {} });

      expect(firstError(result.errors).extensions.code).toBe("UNAUTHENTICATED");
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it("rejects input missing a required field (categoryId) before hitting the repository", async () => {
      const { categoryId, ...withoutCategory } = VALID_INPUT;

      const result = await execute(CREATE_PLACE, {
        variableValues: { input: withoutCategory },
        context: contextAs("5", UserTypeEnum.BUSINESS),
      });

      expect(firstError(result.errors)).toBeDefined();
      expect(mockCreate).not.toHaveBeenCalled();
    });
  });

  describe("updatePlace", () => {
    // The exact bug class doc 2's issue 2 named: requireOwner alone (role
    // check) isn't resource ownership - assertOwnership must independently
    // reject a BUSINESS caller editing someone else's place.
    it("rejects a BUSINESS caller who doesn't own the place", async () => {
      mockFindByPk.mockResolvedValue({ id: 10, ownerId: "owner-a", ...VALID_INPUT });

      const result = await execute(UPDATE_PLACE, {
        variableValues: { placeId: 10, input: VALID_INPUT },
        context: contextAs("owner-b", UserTypeEnum.BUSINESS),
      });

      expect(result.data?.updatePlace).toBeNull();
      expect(firstError(result.errors).extensions.code).toBe("FORBIDDEN");
      expect(mockUpdateOne).not.toHaveBeenCalled();
    });

    it("allows the owning BUSINESS caller to update their own place", async () => {
      mockFindByPk.mockResolvedValueOnce({ id: 10, ownerId: "owner-a", ...VALID_INPUT });
      mockUpdateOne.mockResolvedValue([1]);
      mockFindByPk.mockResolvedValueOnce({ id: 10, ownerId: "owner-a", label: "Renamed Cafe" });

      const result = await execute(UPDATE_PLACE, {
        variableValues: { placeId: 10, input: { ...VALID_INPUT, label: "Renamed Cafe" } },
        context: contextAs("owner-a", UserTypeEnum.BUSINESS),
      });

      expect(result.errors).toBeUndefined();
      expect((result.data?.updatePlace as any).data.label).toBe("Renamed Cafe");
    });
  });
});
