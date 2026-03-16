package skku.gymbarofit.api.user.owner.dto;

import skku.gymbarofit.core.item.equipment.Equipment;

public record OwnerGymEquipmentDto(Long id, String name, String type, String category, String imageUrl, String status) {

    public static OwnerGymEquipmentDto from(Equipment e) {
        return new OwnerGymEquipmentDto(
                e.getId(),
                e.getItemInfo().getName(),
                e.getType(),
                e.getCategory(),
                e.getImageUrl(),
                e.getItemInfo().getStatus().name()
        );
    }
}
