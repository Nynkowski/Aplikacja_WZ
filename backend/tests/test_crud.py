from backend import crud, models


def _create_user(db_session, username="user1"):
    user = models.User(username=username, hashed_password="hashed", type="user")
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


def _create_address(db_session, name, full_address=None):
    address = models.Adress(name=name, full_adress=full_address or f"{name} street")
    db_session.add(address)
    db_session.commit()
    db_session.refresh(address)
    return address


def test_post_user_and_get_user_by_username(db_session, monkeypatch):
    monkeypatch.setattr(crud.auth, "hash_password", lambda password: f"hashed:{password}")

    created = crud.post_user(db_session, username="alice", password="secret", type="admin")
    fetched = crud.get_user_by_username(db_session, "alice")

    assert created.id is not None
    assert created.username == "alice"
    assert created.hashed_password == "hashed:secret"
    assert fetched is not None
    assert fetched.id == created.id


def test_post_adress(db_session):
    created = crud.post_adress(db_session, name="WH1", full_adress="Warehouse 1")

    assert created.name == "WH1"
    assert created.full_adress == "Warehouse 1"


def test_post_wz_regular(db_session):
    user = _create_user(db_session, username="operator")
    _create_address(db_session, "S1", "Sender address")
    _create_address(db_session, "R1", "Recipient address")

    created = crud.post_wz_regular(
        db_session,
        user_id=user.id,
        sender_id="S1",
        recipient_id="R1",
        seal_number="SEAL123",
        car_plates="WX12345",
    )

    assert created.id is not None
    assert created.user_id == user.id
    assert created.sender_id == "S1"
    assert created.recipient_id == "R1"
    assert created.seal_number == "SEAL123"
    assert created.car_plates == "WX12345"


def test_post_wz_content(db_session):
    user = _create_user(db_session, username="author")
    _create_address(db_session, "S2")
    _create_address(db_session, "R2")
    wz = crud.post_wz_regular(
        db_session,
        user_id=user.id,
        sender_id="S2",
        recipient_id="R2",
        seal_number="SEAL456",
        car_plates="WX54321",
    )

    content = crud.post_wz_content(
        db_session,
        wz_id=wz.id,
        adding_user_id=user.id,
        content_description="Boxes: 10",
    )

    assert content.id is not None
    assert content.wz_id == wz.id
    assert content.adding_user_id == user.id
    assert content.content_description == "Boxes: 10"


def test_post_wz_special_sets_default_approval_false(db_session):
    user = _create_user(db_session, username="special_user")
    _create_address(db_session, "SP")

    created = crud.post_wz_special(
        db_session,
        user_id=user.id,
        sender_id="SP",
        recipient="Manual recipient",
        seal_number="SEAL789",
        car_plates="WX99999",
        approver="manager",
    )

    assert created.id is not None
    assert created.user_id == user.id
    assert created.sender_id == "SP"
    assert created.recipient == "Manual recipient"
    assert created.wz_approval is False
    assert created.approver == "manager"


def test_post_wz_special_content(db_session):
    user = _create_user(db_session, username="special_content_user")
    _create_address(db_session, "SP2")
    wz_special = crud.post_wz_special(
        db_session,
        user_id=user.id,
        sender_id="SP2",
        recipient="Special recipient",
        seal_number="SEAL001",
        car_plates="WX00001",
        approver="lead",
    )

    content = crud.post_wz_special_content(
        db_session,
        wz_id=wz_special.id,
        adding_user_id=user.id,
        content_description="Pallets: 5",
    )

    assert content.id is not None
    assert content.wz_id == wz_special.id
    assert content.adding_user_id == user.id
    assert content.content_description == "Pallets: 5"
